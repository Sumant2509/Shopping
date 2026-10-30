/**
 * Comprehensive Security Rate Limiting & Anti-Brute-Force System
 * Features:
 * - IP-based sliding window rate limiter
 * - Per-target OTP dispatch cooldown (60s) & hourly quotas (max 5)
 * - OTP verification attempt throttling & lockout (max 5 wrong tries -> 15 min lock)
 * - Password brute-force protection (max 5 failed logins -> 15 min lock)
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface TargetOtpTracker {
  lastSentAt: number;
  hourlyRequests: number[];
  failedAttempts: number;
  lockedUntil: number;
}

interface LoginAttemptTracker {
  failedAttempts: number;
  lockedUntil: number;
}

const globalForLimiter = globalThis as unknown as {
  _rateLimitStore?: Map<string, RateLimitRecord>;
  _targetOtpStore?: Map<string, TargetOtpTracker>;
  _loginAttemptStore?: Map<string, LoginAttemptTracker>;
};

const rateLimitStore = globalForLimiter._rateLimitStore || new Map<string, RateLimitRecord>();
const targetOtpStore = globalForLimiter._targetOtpStore || new Map<string, TargetOtpTracker>();
const loginAttemptStore = globalForLimiter._loginAttemptStore || new Map<string, LoginAttemptTracker>();

if (process.env.NODE_ENV !== 'production') {
  globalForLimiter._rateLimitStore = rateLimitStore;
  globalForLimiter._targetOtpStore = targetOtpStore;
  globalForLimiter._loginAttemptStore = loginAttemptStore;
}

/**
 * Extracts client IP from request headers safely
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const firstIp = forwarded.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  return '127.0.0.1';
}

/**
 * Generic sliding window rate limiter
 * @param key unique bucket key (e.g. `otp_req_${ip}`)
 * @param limit max requests allowed in the window
 * @param windowMs window size in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newRecord);
    return { success: true, remaining: limit - 1, resetTime: newRecord.resetAt };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetTime: record.resetAt };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetTime: record.resetAt };
}

/**
 * Normalizes phone or email into a consistent tracking key
 */
function normalizeTargetKey(target: string): string {
  const clean = (target || '').trim().toLowerCase();
  if (clean.includes('@')) return `target:email:${clean}`;
  const digits = clean.replace(/[^0-9]/g, '').slice(-10);
  return `target:phone:${digits || clean}`;
}

/**
 * Checks whether an OTP dispatch is allowed for a given recipient
 * Enforces:
 * 1. Target is not locked due to excessive failed attempts (15 min lock)
 * 2. 60-second cooldown between consecutive OTP dispatches
 * 3. Max 5 OTP dispatches per hour
 */
export function checkOtpRequestCooldown(target: string): {
  allowed: boolean;
  waitSeconds?: number;
  reason?: string;
} {
  const key = normalizeTargetKey(target);
  const now = Date.now();
  const tracker = targetOtpStore.get(key);

  if (!tracker) {
    return { allowed: true };
  }

  // 1. Check account / target lock
  if (tracker.lockedUntil > now) {
    const remainingSeconds = Math.ceil((tracker.lockedUntil - now) / 1000);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    return {
      allowed: false,
      waitSeconds: remainingSeconds,
      reason: `Too many failed attempts. Security lock active. Please wait ${remainingMinutes} minute(s) before requesting again.`,
    };
  }

  // 2. 60-second cooldown between requests
  const elapsedSeconds = Math.floor((now - tracker.lastSentAt) / 1000);
  if (elapsedSeconds < 60) {
    const wait = 60 - elapsedSeconds;
    return {
      allowed: false,
      waitSeconds: wait,
      reason: `Please wait ${wait} second(s) before requesting another verification code.`,
    };
  }

  // 3. Hourly limit check (max 5 per 60 minutes)
  const oneHourAgo = now - 60 * 60 * 1000;
  tracker.hourlyRequests = tracker.hourlyRequests.filter((t) => t > oneHourAgo);

  if (tracker.hourlyRequests.length >= 5) {
    const earliest = tracker.hourlyRequests[0];
    const waitSeconds = Math.ceil((earliest + 60 * 60 * 1000 - now) / 1000);
    const waitMinutes = Math.ceil(waitSeconds / 60);
    return {
      allowed: false,
      waitSeconds,
      reason: `Hourly OTP request limit reached. For security, please try again in ${waitMinutes} minute(s).`,
    };
  }

  return { allowed: true };
}

/**
 * Records that an OTP was dispatched
 */
export function recordOtpDispatched(target: string): void {
  const key = normalizeTargetKey(target);
  const now = Date.now();
  const tracker = targetOtpStore.get(key) || {
    lastSentAt: 0,
    hourlyRequests: [],
    failedAttempts: 0,
    lockedUntil: 0,
  };

  tracker.lastSentAt = now;
  tracker.hourlyRequests.push(now);
  targetOtpStore.set(key, tracker);
}

/**
 * Checks if target is currently locked from verifying OTP
 */
export function checkOtpVerificationStatus(target: string): {
  locked: boolean;
  remainingAttempts: number;
  waitMinutes?: number;
} {
  const key = normalizeTargetKey(target);
  const now = Date.now();
  const tracker = targetOtpStore.get(key);

  if (!tracker) {
    return { locked: false, remainingAttempts: 5 };
  }

  if (tracker.lockedUntil > now) {
    const waitMinutes = Math.ceil((tracker.lockedUntil - now) / (60 * 1000));
    return { locked: true, remainingAttempts: 0, waitMinutes };
  }

  const remaining = Math.max(0, 5 - tracker.failedAttempts);
  return { locked: false, remainingAttempts: remaining };
}

/**
 * Records a failed OTP verification attempt
 * Locks target for 15 minutes if 5 wrong attempts are made
 */
export function recordFailedOtpVerification(target: string): {
  locked: boolean;
  remainingAttempts: number;
  lockMinutes?: number;
} {
  const key = normalizeTargetKey(target);
  const now = Date.now();
  const tracker = targetOtpStore.get(key) || {
    lastSentAt: 0,
    hourlyRequests: [],
    failedAttempts: 0,
    lockedUntil: 0,
  };

  tracker.failedAttempts += 1;

  if (tracker.failedAttempts >= 5) {
    tracker.lockedUntil = now + 15 * 60 * 1000; // 15-minute lock
    tracker.failedAttempts = 0;
    targetOtpStore.set(key, tracker);
    return { locked: true, remainingAttempts: 0, lockMinutes: 15 };
  }

  targetOtpStore.set(key, tracker);
  return { locked: false, remainingAttempts: 5 - tracker.failedAttempts };
}

/**
 * Clears failed attempts upon successful OTP verification
 */
export function clearOtpVerificationAttempts(target: string): void {
  const key = normalizeTargetKey(target);
  const tracker = targetOtpStore.get(key);
  if (tracker) {
    tracker.failedAttempts = 0;
    tracker.lockedUntil = 0;
  }
}

/**
 * Password Login Brute-force Protection
 */
function normalizeLoginKey(identifier: string): string {
  return `login:user:${(identifier || '').trim().toLowerCase()}`;
}

export function checkLoginAttempts(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  waitMinutes?: number;
} {
  const key = normalizeLoginKey(identifier);
  const now = Date.now();
  const tracker = loginAttemptStore.get(key);

  if (!tracker) {
    return { locked: false, remainingAttempts: 5 };
  }

  if (tracker.lockedUntil > now) {
    const waitMinutes = Math.ceil((tracker.lockedUntil - now) / (60 * 1000));
    return { locked: true, remainingAttempts: 0, waitMinutes };
  }

  // If lock expired, reset
  if (tracker.lockedUntil > 0 && tracker.lockedUntil <= now) {
    tracker.failedAttempts = 0;
    tracker.lockedUntil = 0;
  }

  const remaining = Math.max(0, 5 - tracker.failedAttempts);
  return { locked: false, remainingAttempts: remaining };
}

export function recordFailedLogin(identifier: string): {
  locked: boolean;
  remainingAttempts: number;
  lockMinutes?: number;
} {
  const key = normalizeLoginKey(identifier);
  const now = Date.now();
  const tracker = loginAttemptStore.get(key) || {
    failedAttempts: 0,
    lockedUntil: 0,
  };

  tracker.failedAttempts += 1;

  if (tracker.failedAttempts >= 5) {
    tracker.lockedUntil = now + 15 * 60 * 1000; // 15-minute lockout
    tracker.failedAttempts = 0;
    loginAttemptStore.set(key, tracker);
    return { locked: true, remainingAttempts: 0, lockMinutes: 15 };
  }

  loginAttemptStore.set(key, tracker);
  return { locked: false, remainingAttempts: 5 - tracker.failedAttempts };
}

export function clearFailedLogin(identifier: string): void {
  const key = normalizeLoginKey(identifier);
  loginAttemptStore.delete(key);
}
