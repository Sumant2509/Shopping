import { NextResponse } from 'next/server';
import { createRazorpayOrder, getRazorpayKeyId, isRazorpayConfigured } from '@/lib/razorpay';

export async function POST(request: Request) {
  try {
    const { amount, receipt } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid order amount' }, { status: 400 });
    }

    const order = await createRazorpayOrder(amount, receipt || `rcpt_${Date.now()}`);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      isLive: isRazorpayConfigured(),
    });
  } catch (error: any) {
    console.error('Razorpay create order error:', error);
    return NextResponse.json({ error: error.message || 'Payment initialization failed' }, { status: 500 });
  }
}
