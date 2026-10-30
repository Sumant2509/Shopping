import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit numeric OTP
 * Using Node.js crypto.randomInt (CSPRNG)
 */
export function generateSecureOtp(digits: number = 6): string {
  if (digits <= 0 || digits > 10) digits = 6;
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits);
  return crypto.randomInt(min, max).toString();
}

/**
 * Constant-time string comparison to mitigate timing attacks on OTP/secret checks
 */
export function safeCompareStrings(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Sanitizes an object or value recursively to prevent NoSQL operator injection
 * (removes any keys starting with '$' or containing '.')
 */
export function sanitizeInput<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // Strip null bytes and normalize
    return input.replace(/\0/g, '').trim() as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizeInput(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, val] of Object.entries(input)) {
      // Reject MongoDB operator keys like $gt, $where, etc.
      if (key.startsWith('$') || key.includes('.')) {
        continue;
      }
      cleanObj[key] = sanitizeInput(val);
    }
    return cleanObj as unknown as T;
  }

  return input;
}

/**
 * Validates password complexity
 * Requires minimum 6 characters for customer accounts
 */
export function validatePasswordComplexity(password: string, isCustomer: boolean = true): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  const minLength = isCustomer ? 6 : 8;
  if (password.length < minLength) {
    return { valid: false, message: `Password must be at least ${minLength} characters long` };
  }
  if (!isCustomer) {
    if (!/[A-Za-z]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one letter' };
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, message: 'Password must contain at least one number' };
    }
  }
  return { valid: true };
}
