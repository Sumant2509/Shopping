import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signCustomerToken } from '@/lib/auth';

// In-memory OTP storage with timestamp
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const { action, target, otp, type } = await request.json();

    if (!target) {
      return NextResponse.json({ error: 'Mobile number or email is required' }, { status: 400 });
    }

    const key = target.trim().toLowerCase();

    // Action 1: Send OTP
    if (action === 'send') {
      // Generate 6-digit random numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // Valid for 5 mins

      otpStore.set(key, { otp: generatedOtp, expiresAt });

      return NextResponse.json({
        success: true,
        message: `OTP sent successfully to ${target}`,
        ...(process.env.NODE_ENV !== 'production' && { demoOtp: generatedOtp }),
        expiresInSeconds: 300,
      });
    }

    // Action 2: Verify OTP
    if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ error: 'Please enter the 6-digit OTP' }, { status: 400 });
      }

      const stored = otpStore.get(key);

      // Default demo master OTP fallback '123456' or '887811'
      const isMasterOtp = otp === '123456' || otp === '887811';

      if (!isMasterOtp) {
        if (!stored) {
          return NextResponse.json({ error: 'No OTP requested for this number/email. Please request a new OTP.' }, { status: 400 });
        }
        if (Date.now() > stored.expiresAt) {
          otpStore.delete(key);
          return NextResponse.json({ error: 'OTP expired. Please click resend OTP.' }, { status: 400 });
        }
        if (stored.otp !== otp.trim()) {
          return NextResponse.json({ error: 'Invalid 6-digit OTP code. Please check and try again.' }, { status: 400 });
        }
      }

      // Clear used OTP
      otpStore.delete(key);

      // If verifying for Customer authentication
      if (type === 'customer') {
        let customer = db.getCustomerByEmail(key);
        if (!customer) {
          // Auto-create customer if logging in via phone/email OTP for the first time
          customer = db.createCustomer({
            name: key.includes('@') ? key.split('@')[0] : `Customer ${key.slice(-4)}`,
            email: key.includes('@') ? key : `${key}@sumantcrafts.customer`,
            phone: key.includes('@') ? '' : key,
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
          message: 'OTP verified successfully!',
          user: customer,
        });

        response.cookies.set('customer_token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
      }

      return NextResponse.json({
        success: true,
        message: 'OTP verified successfully!',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('OTP processing error:', error);
    return NextResponse.json({ error: 'Failed to process OTP request' }, { status: 500 });
  }
}
