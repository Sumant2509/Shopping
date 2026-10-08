import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signCustomerToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const customer = db.getCustomerByEmail(email);
    if (!customer) {
      return NextResponse.json({ error: 'No account found with this email' }, { status: 401 });
    }

    if (!customer.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated. Contact support.' }, { status: 403 });
    }

    const valid = await verifyPassword(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
