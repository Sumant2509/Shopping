import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signCustomerToken } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import {
  rateLimit,
  getClientIp,
  checkLoginAttempts,
  recordFailedLogin,
  clearFailedLogin,
} from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const ipCheck = rateLimit(`login_ip_${clientIp}`, 15, 60 * 1000);
    if (!ipCheck.success) {
      return NextResponse.json(
        { error: 'Too many login attempts from your IP. Please wait a minute.' },
        { status: 429 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const identifier = (body.identifier || body.email || body.phone || '').toString().trim();
    const { password } = body;

    if (!identifier || !password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Mobile number or Email address and password are required' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const cleanPhone = identifier.replace(/[^0-9]/g, '').slice(-10);
    const lockoutKey = isEmail ? identifier.toLowerCase() : (cleanPhone || identifier);

    // Check account lockout status
    const lockCheck = checkLoginAttempts(lockoutKey);
    if (lockCheck.locked) {
      return NextResponse.json(
        {
          error: `Account is temporarily locked due to 5 consecutive failed login attempts. Please try again in ${lockCheck.waitMinutes || 15} minutes.`,
        },
        { status: 429 }
      );
    }

    let customer = isEmail
      ? db.getCustomerByEmail(identifier.toLowerCase())
      : (cleanPhone.length >= 10 ? db.getCustomerByPhone(cleanPhone) : undefined);

    // Fallback search
    if (!customer && !isEmail) {
      customer = db.getCustomerByEmail(identifier.toLowerCase());
    }
    if (!customer && isEmail && cleanPhone.length >= 10) {
      customer = db.getCustomerByPhone(cleanPhone);
    }

    if (!customer) {
      const fail = recordFailedLogin(lockoutKey);
      return NextResponse.json(
        {
          error: fail.locked
            ? 'Account locked for 15 minutes due to repeated failed attempts.'
            : isEmail
            ? 'No account found with this email address. Please register or check your spelling.'
            : 'No account found with this mobile number. Please register or check your number.',
        },
        { status: 401 }
      );
    }

    if (!customer.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact customer support.' },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) {
      const fail = recordFailedLogin(lockoutKey);
      if (fail.locked) {
        return NextResponse.json(
          {
            error: 'Security alert: 5 incorrect password attempts reached. Account locked for 15 minutes.',
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `Incorrect password. ${fail.remainingAttempts} attempt(s) remaining before security lockout.`,
        },
        { status: 401 }
      );
    }

    // Success: clear lockout counters
    clearFailedLogin(lockoutKey);

    const token = await signCustomerToken({
      id: customer.id,
      name: customer.name,
      email: customer.email,
    });

    const response = NextResponse.json({
      success: true,
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
  } catch (error) {
    console.error('Customer login error:', error);
    return NextResponse.json({ error: 'Login processing failed. Please try again.' }, { status: 500 });
  }
}
