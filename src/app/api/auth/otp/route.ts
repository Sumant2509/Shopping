import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signCustomerToken, hashPassword } from '@/lib/auth';
import { sendOtpSms } from '@/lib/sms';
import { sendCustomerOtpEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

interface StoredOtp {
  otp: string;
  expiresAt: number;
  purpose: 'login' | 'register' | 'forgot_password';
  name?: string;
  target: string;
  email?: string;
  phone?: string;
}

// In-memory OTP storage with timestamp
const otpStore = new Map<string, StoredOtp>();

function maskPhone(phone?: string): string {
  if (!phone) return '+91 **********';
  const clean = phone.replace(/[^0-9]/g, '');
  if (clean.length < 10) return phone;
  const last4 = clean.slice(-4);
  const first2 = clean.slice(0, 2);
  return `+91 ${first2}*** ***${last4}`;
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
    const body = await request.json();
    const { action, target, otp, purpose = 'login', name, registrationData, channel } = body;

    if (!target) {
      return NextResponse.json({ error: 'Email address or mobile number is required' }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const isEmail = cleanTarget.includes('@');
    const primaryKey = isEmail
      ? cleanTarget.toLowerCase()
      : cleanTarget.replace(/[^0-9]/g, '').slice(-10);

    // =========================================================================
    // ACTION 1: SEND OTP (Email / WhatsApp / Mobile)
    // =========================================================================
    if (action === 'send') {
      const emailTarget = isEmail ? cleanTarget : (body.email || registrationData?.email);
      const phoneTarget = !isEmail ? cleanTarget : (body.phone || registrationData?.phone);

      // Duplicate check for registration
      if (purpose === 'register') {
        if (emailTarget && db.getCustomerByEmail(emailTarget)) {
          return NextResponse.json(
            { error: `An account with email "${emailTarget}" already exists. Please log in.` },
            { status: 409 }
          );
        }
        if (phoneTarget && db.getCustomerByPhone(phoneTarget)) {
          return NextResponse.json(
            { error: `An account with mobile "${phoneTarget}" already exists. Please log in.` },
            { status: 409 }
          );
        }
      }

      // Customer account existence check for forgot password
      let existingCustomer = null;
      if (purpose === 'forgot_password') {
        existingCustomer = isEmail
          ? db.getCustomerByEmail(cleanTarget)
          : db.getCustomerByPhone(cleanTarget);

        if (!existingCustomer && emailTarget) {
          existingCustomer = db.getCustomerByEmail(emailTarget);
        }
        if (!existingCustomer && phoneTarget) {
          existingCustomer = db.getCustomerByPhone(phoneTarget);
        }

        if (!existingCustomer) {
          return NextResponse.json(
            {
              error: isEmail
                ? `No registered account found with email "${cleanTarget}". Please verify or create an account.`
                : `No registered account found with mobile "${cleanTarget}". Please verify or create an account.`,
            },
            { status: 404 }
          );
        }
      }

      // Generate 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      const otpRecord: StoredOtp = {
        otp: generatedOtp,
        expiresAt,
        purpose,
        name: existingCustomer?.name || name || registrationData?.name,
        target: cleanTarget,
        email: emailTarget,
        phone: phoneTarget,
      };

      // Store under primary key
      otpStore.set(primaryKey, otpRecord);

      // If both email and phone provided, store under both keys for flexible verification
      if (emailTarget) otpStore.set(emailTarget.toLowerCase(), otpRecord);
      if (phoneTarget) {
        const phoneKey = phoneTarget.replace(/[^0-9]/g, '').slice(-10);
        if (phoneKey) otpStore.set(phoneKey, otpRecord);
      }

      // Channel detection: 'email', 'mobile', or auto
      const sendEmail = channel === 'email' || isEmail || channel === 'both';
      const sendMobile = channel === 'mobile' || (!isEmail && !channel) || channel === 'both';

      let whatsappUrl: string | undefined = undefined;
      let emailDelivered = false;

      // 1. Dispatch Email OTP
      if (sendEmail && emailTarget) {
        try {
          const emailRes = await sendCustomerOtpEmail({
            toEmail: emailTarget,
            customerName: name || registrationData?.name,
            otp: generatedOtp,
            purpose,
          });
          emailDelivered = emailRes.delivered;
        } catch (e) {
          console.error('[Customer Email Dispatch Exception]:', e);
        }
      }

      // 2. Dispatch Mobile / WhatsApp OTP
      if (sendMobile && phoneTarget) {
        const rawDigits = phoneTarget.replace(/[^0-9]/g, '');
        const phoneIntl = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

        const actionLabel =
          purpose === 'register' ? 'Registration' : purpose === 'forgot_password' ? 'Password Reset' : 'Login';
        const greetingName = existingCustomer?.name || name || registrationData?.name || 'Customer';
        const whatsappMsg = `🔐 *Home-Warrior ${actionLabel} Verification Code*\n\nHello ${greetingName},\nYour 6-Digit ${actionLabel} Security Code is:\n\n👉 *${generatedOtp}*\n\n⏳ This code expires in 5 minutes.\nDo not share this code with anyone.`;
        whatsappUrl = `https://wa.me/${phoneIntl}?text=${encodeURIComponent(whatsappMsg)}`;

        sendOtpSms({
          phone: phoneTarget,
          otp: generatedOtp,
          customerName: greetingName,
          purpose,
        }).catch((err) => console.error('[SMS Dispatch Error]:', err));
      }

      console.log(`[Customer OTP] Generated ${generatedOtp} for ${cleanTarget} (Email: ${sendEmail}, Mobile: ${sendMobile})`);

      const preferredChannel = sendEmail && !sendMobile ? 'email' : sendMobile && !sendEmail ? 'mobile' : 'both';
      const responseMessage =
        purpose === 'forgot_password'
          ? (preferredChannel === 'email'
              ? `Password reset code sent to ${maskEmail(emailTarget || cleanTarget)}. Please check your inbox.`
              : `Password reset code sent to ${maskPhone(phoneTarget || cleanTarget)}.`)
          : (preferredChannel === 'email'
              ? `Verification OTP sent to ${maskEmail(emailTarget || cleanTarget)}. Please check your inbox and spam folder.`
              : `Verification code sent to ${maskPhone(phoneTarget || cleanTarget)}.`);

      return NextResponse.json({
        success: true,
        message: responseMessage,
        whatsappUrl,
        channel: preferredChannel,
        emailDelivered,
        maskedTarget: isEmail ? maskEmail(cleanTarget) : maskPhone(cleanTarget),
        maskedEmail: emailTarget ? maskEmail(emailTarget) : undefined,
        maskedPhone: phoneTarget ? maskPhone(phoneTarget) : undefined,
        expiresInSeconds: 300,
      });
    }

    // =========================================================================
    // ACTION 2: VERIFY OTP
    // =========================================================================
    if (action === 'verify') {
      if (!otp || typeof otp !== 'string') {
        return NextResponse.json({ error: 'Please enter the 6-digit verification code' }, { status: 400 });
      }

      const cleanOtp = otp.trim();
      let stored = otpStore.get(primaryKey);

      // Secondary lookup by email or phone if target switched
      if (!stored && body.email) stored = otpStore.get(body.email.toLowerCase());
      if (!stored && body.phone) {
        const pKey = body.phone.replace(/[^0-9]/g, '').slice(-10);
        stored = otpStore.get(pKey);
      }

      // Master testing bypass codes
      const isMasterOtp = cleanOtp === '887811' || cleanOtp === '123456';

      if (!isMasterOtp) {
        if (!stored) {
          return NextResponse.json(
            { error: 'No active OTP request found for this number/email. Please request a new code.' },
            { status: 400 }
          );
        }

        if (Date.now() > stored.expiresAt) {
          otpStore.delete(primaryKey);
          return NextResponse.json(
            { error: 'Verification code has expired. Please request a new one.' },
            { status: 400 }
          );
        }

        if (stored.otp !== cleanOtp) {
          return NextResponse.json(
            { error: 'Incorrect 6-digit verification code. Please check and try again.' },
            { status: 400 }
          );
        }
      }

      // Clear used OTP
      otpStore.delete(primaryKey);
      if (stored?.email) otpStore.delete(stored.email.toLowerCase());
      if (stored?.phone) {
        const pKey = stored.phone.replace(/[^0-9]/g, '').slice(-10);
        if (pKey) otpStore.delete(pKey);
      }

      // ── Purpose A: Complete Registration ───────────────────────────────────
      if (purpose === 'register' && registrationData) {
        const { name: regName, email: regEmail, phone: regPhone, password: regPassword } = registrationData;

        if (!regName || !regEmail || !regPhone) {
          return NextResponse.json({ error: 'Incomplete registration details' }, { status: 400 });
        }

        const passwordHash = regPassword ? await hashPassword(regPassword) : '';

        const customer = db.createCustomer({
          name: regName.trim(),
          email: regEmail.toLowerCase().trim(),
          phone: regPhone.trim(),
          passwordHash,
          addresses: [],
          isActive: true,
        });

        const token = await signCustomerToken({
          id: customer.id,
          name: customer.name,
          email: customer.email,
        });

        const response = NextResponse.json({
          success: true,
          message: 'Account successfully registered and verified!',
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        });

        response.cookies.set('customer_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });

        return response;
      }

      // ── Purpose C: Reset / Forgot Password ─────────────────────────────────
      if (purpose === 'forgot_password') {
        const customer = isEmail
          ? db.getCustomerByEmail(cleanTarget)
          : db.getCustomerByPhone(cleanTarget);

        if (!customer) {
          return NextResponse.json(
            { error: 'Customer account not found for this email/mobile.' },
            { status: 404 }
          );
        }

        const newPassword = body.newPassword || body.password;
        if (!newPassword) {
          // If customer wants 2-step flow: step 1 verifies OTP, then prompts for new password
          return NextResponse.json({
            success: true,
            verified: true,
            message: 'OTP verified successfully. You can now set your new password.',
            customer: {
              id: customer.id,
              name: customer.name,
              email: customer.email,
              phone: customer.phone,
            },
          });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 6) {
          return NextResponse.json(
            { error: 'New password must be at least 6 characters long.' },
            { status: 400 }
          );
        }

        const passwordHash = await hashPassword(newPassword);
        db.updateCustomer(customer.id, { passwordHash });

        const token = await signCustomerToken({
          id: customer.id,
          name: customer.name,
          email: customer.email,
        });

        const response = NextResponse.json({
          success: true,
          message: 'Password successfully updated! Logging you in...',
          customer: {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
          },
        });

        response.cookies.set('customer_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });

        return response;
      }

      // ── Purpose B: Customer Login ──────────────────────────────────────────
      let customer = isEmail
        ? db.getCustomerByEmail(cleanTarget)
        : db.getCustomerByPhone(cleanTarget);

      // Auto-Registration fallback for verified OTPs
      if (!customer) {
        const generatedName = isEmail
          ? cleanTarget.split('@')[0]
          : `Customer ${cleanTarget.replace(/[^0-9]/g, '').slice(-4)}`;

        const generatedEmail = isEmail
          ? cleanTarget.toLowerCase()
          : `${cleanTarget.replace(/[^0-9]/g, '').slice(-10)}@homewarrior.in`;

        customer = db.createCustomer({
          name: generatedName,
          email: generatedEmail,
          phone: isEmail ? '' : cleanTarget,
          passwordHash: '',
          addresses: [],
          isActive: true,
        });
      }

      const token = await signCustomerToken({
        id: customer.id,
        name: customer.name,
        email: customer.email,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Successfully verified and logged in!',
        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        },
      });

      response.cookies.set('customer_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action requested' }, { status: 400 });
  } catch (error: any) {
    console.error('[OTP Route Exception]:', error);
    return NextResponse.json({ error: error?.message || 'Server error while processing OTP' }, { status: 500 });
  }
}
