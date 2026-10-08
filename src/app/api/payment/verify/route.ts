import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderNumber } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing payment signature verification parameters' }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Payment signature verification failed' }, { status: 400 });
    }

    // Update order in database if orderNumber supplied
    if (orderNumber) {
      db.updateOrderStatus(orderNumber, 'CONFIRMED', undefined, undefined, 'PAID');
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
