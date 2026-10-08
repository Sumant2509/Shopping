import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signCustomerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json({ error: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
    }

    // Check if already registered
    const existing = db.getCustomerByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const customer = db.createCustomer({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\s/g, ''),
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
