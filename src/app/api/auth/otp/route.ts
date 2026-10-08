import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signCustomerToken, hashPassword } from '@/lib/auth';
import { sendOtpSms } from '@/lib/sms';
import { sendCustomerOtpEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

interface StoredOtp {
  otp: string;
  expiresAt: number;
  purpose: 'login' | 'register';
  name?: string;
  target: string;
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
    const { action, target, otp, purpose = 'login', name, registrationData } = body;

    if (!target) {
      return NextResponse.json({ error: 'Mobile number or email address is required' }, { status: 400 });
    }

    const cleanTarget = target.trim();
    const isEmail = cleanTarget.includes('@');
    const key = isEmail
      ? cleanTarget.toLowerCase()
      : cleanTarget.replace(/[^0-9]/g, '').slice(-10);

    // =========================================================================
    // ACTION 1: SEND OTP
    // =========================================================================
    if (action === 'send') {
      // If registering, check for duplicate existing account
      if (purpose === 'register') {
        const existing = isEmail
          ? db.getCustomerByEmail(cleanTarget)
          : db.getCustomerByPhone(cleanTarget);

        if (existing) {
          return NextResponse.json(
            { error: `An account with this ${isEmail ? 'email' : 'mobile number'} already exists. Please log in instead.` },
            { status: 409 }
          );
        }
      }

      // Generate 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      otpStore.set(key, {
        otp: generatedOtp,
        expiresAt,
        purpose,
        name,
        target: cleanTarget,
      });

      // Prepare Delivery Channels
      let whatsappUrl: string | undefined = undefined;

      if (!isEmail) {
        // Indian phone formatting
        const rawDigits = cleanTarget.replace(/[^0-9]/g, '');
        const phoneIntl = rawDigits.length === 10 ? `91${rawDigits}` : rawDigits;

        // WhatsApp direct link with Home-Warrior template
        const actionLabel = purpose === 'register' ? 'Registration' : 'Login';
        const greetingName = name || 'Customer';
        const whatsappMsg = `🔐 *Home-Warrior ${actionLabel} Verification Code*\n\nHello ${greetingName},\nYour 6-Digit ${actionLabel} Security Code is:\n\n👉 *${generatedOtp}*\n\n⏳ This code expires in 5 minutes.\nDo not share this code with anyone.`;
        whatsappUrl = `https://wa.me/${phoneIntl}?text=${encodeURIComponent(whatsappMsg)}`;

        // Send via SMS Gateway (Fast2SMS / Twilio)
        sendOtpSms({
          phone: cleanTarget,
          otp: generatedOtp,
          customerName: name,
          purpose,
        }).catch((err) => console.error('[SMS Dispatch Error]:', err));
      } else {
        // Send via Email Gateway
        sendCustomerOtpEmail({
          toEmail: cleanTarget,
          customerName: name,
          otp: generatedOtp,
          purpose,
        }).catch((err) => console.error('[Email Dispatch Error]:', err));
      }

      console.log(`[Customer OTP] Generated ${generatedOtp} for ${cleanTarget} (${purpose})`);

      return NextResponse.json({
        success: true,
        message: isEmail
          ? `Verification code dispatched to ${maskEmail(cleanTarget)}. Check your Inbox/Spam folder.`
          : `Verification code prepared for ${maskPhone(cleanTarget)}.`,
        whatsappUrl,
        channel: isEmail ? 'email' : 'mobile',
        maskedTarget: isEmail ? maskEmail(cleanTarget) : maskPhone(cleanTarget),
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
      const stored = otpStore.get(key);

      // Testing bypass codes
      const isMasterOtp = cleanOtp === '887811' || cleanOtp === '123456';

      if (!isMasterOtp) {
        if (!stored) {
          return NextResponse.json(
            { error: 'No active OTP request found for this number/email. Please request a new code.' },
            { status: 400 }
          );
        }

        if (Date.now() > stored.expiresAt) {
          otpStore.delete(key);
          return NextResponse.json(
            { error: 'Verification code has expired. Please request a new one.' },
            { status: 400 }
          );
        }

        if (stored.otp !== cleanOtp) {
          return NextResponse.json(
            { error: 'Incorrect verification code. Please check and try again.' },
            { status: 400 }
          );
        }
      }

      // Clear used OTP
      otpStore.delete(key);

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

      // ── Purpose B: Customer Login ──────────────────────────────────────────
      let customer = isEmail
        ? db.getCustomerByEmail(cleanTarget)
        : db.getCustomerByPhone(cleanTarget);

      // Instant Auto-Registration for new mobile logins (Modern Indian e-commerce UX)
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
