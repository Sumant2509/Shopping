import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateOrderNumber, getEstimatedDeliveryDate } from '@/lib/utils';
import { calculateShippingFee } from '@/lib/shipping';
import { verifyAdminToken } from '@/lib/auth';
import { verifyRazorpaySignature } from '@/lib/razorpay';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = db.getOrders();
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer,
      items,
      paymentMethod,
      couponCode,
      notes,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      upiUtr,
      upiTransactionId,
    } = body;

    if (!customer || !customer.name || !customer.phone || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required customer or items information' }, { status: 400 });
    }

    // Recalculate amounts securely on server
    let subtotal = 0;
    const validatedItems = items.map((item: any) => {
      const product = db.getProductById(item.productId);
      const price = product ? product.price : item.price;
      const mrp = product ? product.mrp : item.mrp;
      subtotal += price * item.quantity;
      return {
        ...item,
        price,
        mrp,
      };
    });

    let discount = 0;
    if (couponCode) {
      const coupon = db.getCouponByCode(couponCode);
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountPercent) {
          discount = Math.round((subtotal * coupon.discountPercent) / 100);
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else if (coupon.discountAmount) {
          discount = Math.min(coupon.discountAmount, subtotal);
        }
      }
    }

    const shippingFee = calculateShippingFee(subtotal);
    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    const isCOD = paymentMethod === 'COD';

    // Verify online payment authenticity for UPI / Cards / Net Banking
    if (!isCOD) {
      const hasUpiRef = Boolean(upiUtr || upiTransactionId);
      const hasRazorpayTokens = Boolean(razorpayOrderId && razorpayPaymentId && razorpaySignature);

      if (!hasUpiRef && !hasRazorpayTokens) {
        return NextResponse.json(
          { error: 'Payment reference or verification token is required for online payment.' },
          { status: 400 }
        );
      }

      if (hasRazorpayTokens) {
        const isValidSignature = verifyRazorpaySignature(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );

        if (!isValidSignature) {
          return NextResponse.json(
            { error: 'Payment verification failed. Invalid transaction signature.' },
            { status: 400 }
          );
        }
      }
    }

    const orderNumber = generateOrderNumber();
    const estimatedDelivery = getEstimatedDeliveryDate(5);

    const newOrder = db.createOrder({
      orderNumber,
      customer,
      items: validatedItems,
      subtotal,
      shippingFee,
      discount,
      couponCode: discount > 0 ? couponCode : undefined,
      totalAmount,
      paymentMethod,
      paymentStatus: isCOD ? 'PENDING' : 'PAID',
      razorpayOrderId: isCOD ? undefined : razorpayOrderId,
      razorpayPaymentId: isCOD ? undefined : (razorpayPaymentId || upiTransactionId || upiUtr),
      upiUtr: upiUtr ? String(upiUtr).trim() : undefined,
      upiTransactionId: upiTransactionId ? String(upiTransactionId).trim() : undefined,
      orderStatus: 'CONFIRMED',
      estimatedDeliveryDate: estimatedDelivery,
      notes,
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
