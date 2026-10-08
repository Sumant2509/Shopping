import { NextRequest, NextResponse } from 'next/server';
import { POST as handleOtpPost } from '@/app/api/auth/otp/route';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Translate to OTP route format with purpose: 'forgot_password'
    const payload = {
      ...body,
      purpose: 'forgot_password',
      action: body.action || (body.otp ? 'verify' : 'send'),
    };

    const newReq = new Request(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(payload),
    });

    return await handleOtpPost(newReq);
  } catch (error: any) {
    console.error('[Reset Password Route Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
