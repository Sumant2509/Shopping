import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signCustomerToken } from '@/lib/auth';
import { sanitizeInput, validatePasswordComplexity } from '@/lib/security';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const ipCheck = rateLimit(`register_ip_${clientIp}`, 10, 60 * 1000);
    if (!ipCheck.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts from your IP. Please wait a minute.' },
        { status: 429 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { name, email, phone, password } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const complexity = validatePasswordComplexity(password);
    if (!complexity.valid) {
      return NextResponse.json({ error: complexity.message || 'Password does not meet security requirements' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const phoneDigits = phone.replace(/[^0-9]/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    // Check if already registered
    const cleanEmail = email.toLowerCase().trim();
    const existing = db.getCustomerByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }

    const cleanPhone = phoneDigits.slice(-10);
    const existingPhone = db.getCustomerByPhone(cleanPhone);
    if (existingPhone) {
      return NextResponse.json({ error: 'An account with this mobile number already exists. Please log in.' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const customer = db.createCustomer({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash,
      addresses: [],
      isActive: true,
    });

    const token = await signCustomerToken({ id: customer.id, name: customer.name, email: customer.email });

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
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
