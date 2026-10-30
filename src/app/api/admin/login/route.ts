import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signAdminToken } from '@/lib/auth';
import { sendOtpEmail } from '@/lib/email';
import { sendOtpSms } from '@/lib/sms';
import { generateSecureOtp, safeCompareStrings, sanitizeInput } from '@/lib/security';
import {
  rateLimit,
  getClientIp,
  checkLoginAttempts,
  recordFailedLogin,
  clearFailedLogin,
  checkOtpVerificationStatus,
  recordFailedOtpVerification,
  clearOtpVerificationAttempts,
  checkOtpRequestCooldown,
  recordOtpDispatched,
} from '@/lib/rate-limit';
import { sendAutomatedWhatsAppNotification, createCustomerArattaiLink } from '@/lib/whatsapp';

// In-memory Admin OTP store: username -> { otp, channel, expiresAt, adminId }
const adminOtpStore = new Map<
  string,
  { otp: string; channel: 'mobile' | 'email'; expiresAt: number; adminId: string }
>();

function maskPhone(phone?: string): string {
  if (!phone) return '+91 **********';
  const clean = phone.trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 6);
  const end = clean.slice(-2);
  return `${start}*** ***${end}`;
}

function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  const start = local.slice(0, 2);
  return `${start}***@${domain}`;
}

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const ipCheck = rateLimit(`admin_login_ip_${clientIp}`, 15, 60 * 1000);
    if (!ipCheck.success) {
      return NextResponse.json(
        { error: 'Too many requests from your IP. Security rate limit active. Please wait 1 minute.' },
        { status: 429 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { username, password, otp, step, channel = 'mobile' } = body;

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Please enter Admin username or email' }, { status: 400 });
    }

    const cleanUsername = username.trim();
    const admin = db.getAdminUser(cleanUsername);
    if (!admin) {
      // Record failed attempt against IP/identifier to prevent user enumeration
      recordFailedLogin(cleanUsername);
      return NextResponse.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    if (admin.isActive === false) {
      return NextResponse.json({ error: 'This admin account is currently deactivated. Contact Super Admin.' }, { status: 403 });
    }

    // Check account lockout status
    const lockStatus = checkLoginAttempts(admin.username);
    if (lockStatus.locked) {
      return NextResponse.json(
        {
          error: `Security Lockout: Admin account is locked due to 5 consecutive failed attempts. Please try again in ${lockStatus.waitMinutes || 15} minutes.`,
        },
        { status: 429 }
      );
    }

    // =========================================================================
    // STEP: Switch Channel or Resend OTP
    // =========================================================================
    if (step === 'resend_otp' || step === 'switch_channel' || step === 'send_otp') {
      // Cooldown check for Admin OTP dispatch
      const cooldownCheck = checkOtpRequestCooldown(admin.username);
      if (!cooldownCheck.allowed) {
        return NextResponse.json(
          { error: cooldownCheck.reason || 'Please wait before requesting another OTP.' },
          { status: 429 }
        );
      }

      const selectedChannel: 'mobile' | 'email' = channel === 'email' ? 'email' : 'mobile';
      const generatedOtp = generateSecureOtp(6);

      adminOtpStore.set(admin.username.toLowerCase(), {
        otp: generatedOtp,
        channel: selectedChannel,
        expiresAt: Date.now() + 5 * 60 * 1000,
        adminId: admin.id,
      });

      recordOtpDispatched(admin.username);
      if (admin.phone) recordOtpDispatched(admin.phone);
      if (admin.email) recordOtpDispatched(admin.email);

      let emailStatus: { delivered: boolean; error?: string } = { delivered: false };
      let smsStatus: { delivered: boolean; error?: string } = { delivered: false };

      // 1. ALWAYS dispatch to Admin Email (Zoho Mail & Gmail)
      if (admin.email) {
        emailStatus = await sendOtpEmail({
          toEmail: admin.email,
          adminName: admin.name,
          otp: generatedOtp,
          roleTitle: admin.role === 'manager' ? 'Store Manager' : admin.role === 'support' ? 'Support Team' : 'Super Admin',
        });
      }

      // 2. Dispatch to Mobile (SMS / WhatsApp) if phone exists
      if (admin.phone) {
        sendOtpSms({
          phone: admin.phone,
          otp: generatedOtp,
          adminName: admin.name,
        }).then((res) => { smsStatus = res; }).catch(() => {});

        const waMsg = `🔐 *Home-Warrior Admin Security 2FA*\n\nHello *${admin.name}*,\nYour 6-Digit Admin Login Security Code is:\n\n👉 *${generatedOtp}*\n\n⏳ This code expires in 5 minutes.\nDo not share this code with anyone.\n\n*Home-Warrior Handcrafted Textiles*`;
        sendAutomatedWhatsAppNotification({
          phone: admin.phone,
          message: waMsg,
        }).catch((err) => console.error('[WhatsApp Admin OTP Notify Error]:', err));
      }

      console.log(`[Admin 2FA] Cryptographic OTP generated and sent to Email (${admin.email}) & Mobile (${admin.phone})`);

      const message = selectedChannel === 'email'
        ? (emailStatus.delivered
            ? `Security OTP sent to your Email (${maskEmail(admin.email)})! Check your Inbox and Spam.`
            : `Security OTP sent to your Email (${maskEmail(admin.email)}). Check Spam/Updates folder.`)
        : `Security OTP sent to your Email (${maskEmail(admin.email)}) and WhatsApp (${maskPhone(admin.phone)}).`;

      return NextResponse.json({
        success: true,
        channel: selectedChannel,
        requiresOtp: true,
        message,
        emailDelivered: emailStatus.delivered,
        smsDelivered: smsStatus.delivered,
        maskedTarget: maskEmail(admin.email),
        user: {
          id: admin.id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
          maskedPhone: maskPhone(admin.phone),
          maskedEmail: maskEmail(admin.email),
          phone: admin.phone,
          email: admin.email,
        },
      });
    }

    // =========================================================================
    // STEP 1: Verify Password & Sign In
    // =========================================================================
    if (step === 'password' || (!step && !otp)) {
      if (!password || typeof password !== 'string') {
        return NextResponse.json({ error: 'Please enter Admin password' }, { status: 400 });
      }

      let isValid = false;

      // 1. Password verification against bcrypt hash
      if (admin.passwordHash) {
        isValid = await verifyPassword(password, admin.passwordHash);
      }

      if (!isValid) {
        const failure = recordFailedLogin(admin.username);
        if (failure.locked) {
          return NextResponse.json(
            { error: 'Security alert: 5 incorrect password attempts reached. Account locked for 15 minutes.' },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: `Invalid password. ${failure.remainingAttempts} attempt(s) remaining before security lockout.` },
          { status: 401 }
        );
      }

      // Valid password: clear failure counters
      clearFailedLogin(admin.username);

      // Sign JWT Admin Token
      const token = await signAdminToken({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
      });

      const response = NextResponse.json({
        success: true,
        requiresOtp: false,
        message: `Logged in as ${admin.name} (${admin.role})`,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone,
        },
      });

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // =========================================================================
    // STEP 2: Verify 6-digit 2FA OTP & Complete Admin Login
    // =========================================================================
    if (step === 'otp' || otp) {
      if (!otp || typeof otp !== 'string') {
        return NextResponse.json({ error: 'Please enter the 6-digit Security OTP' }, { status: 400 });
      }

      const cleanOtp = otp.trim();

      // Check OTP lockout
      const otpLock = checkOtpVerificationStatus(admin.username);
      if (otpLock.locked) {
        return NextResponse.json(
          { error: `Too many failed OTP attempts. 2FA verification locked for ${otpLock.waitMinutes || 15} minutes.` },
          { status: 429 }
        );
      }

      const stored = adminOtpStore.get(admin.username.toLowerCase());
      if (!stored) {
        return NextResponse.json({ error: 'OTP session expired or not found. Please login again.' }, { status: 400 });
      }
      if (Date.now() > stored.expiresAt) {
        adminOtpStore.delete(admin.username.toLowerCase());
        return NextResponse.json({ error: 'OTP code expired. Please request a new OTP.' }, { status: 400 });
      }

      // Constant-time check
      const isMatch = safeCompareStrings(stored.otp, cleanOtp);
      if (!isMatch) {
        const failure = recordFailedOtpVerification(admin.username);
        if (failure.locked) {
          adminOtpStore.delete(admin.username.toLowerCase());
          return NextResponse.json(
            { error: 'Security alert: 5 incorrect OTP attempts exceeded. Code invalidated and 2FA locked for 15 minutes.' },
            { status: 429 }
          );
        }
        return NextResponse.json(
          { error: `Incorrect 6-digit OTP code. ${failure.remainingAttempts} attempt(s) remaining.` },
          { status: 400 }
        );
      }

      // Success: clear counters & delete stored OTP
      adminOtpStore.delete(admin.username.toLowerCase());
      clearOtpVerificationAttempts(admin.username);
      clearFailedLogin(admin.username);

      const token = await signAdminToken({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        phone: admin.phone,
      });

      const response = NextResponse.json({
        success: true,
        message: `2FA Authentication Successful! Welcome, ${admin.name}`,
        user: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          phone: admin.phone,
        },
      });

      response.cookies.set('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid login step' }, { status: 400 });
  } catch (error) {
    console.error('Admin Login error:', error);
    return NextResponse.json({ error: 'Admin Login processing failed' }, { status: 500 });
  }
}
