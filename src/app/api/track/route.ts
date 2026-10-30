import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const limit = rateLimit(`track_ip_${clientIp}`, 15, 60 * 1000);
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many tracking requests from your IP. Please wait a minute.' },
        { status: 429 }
      );
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { orderNumber, phone } = body;

    if (!orderNumber || !phone) {
      return NextResponse.json({ error: 'Please enter both Order ID and Mobile Number' }, { status: 400 });
    }

    const order = db.lookupOrder(orderNumber.trim(), phone.trim());

    if (!order) {
      return NextResponse.json(
        { error: 'No order found matching this Order Number and Mobile Number. Please double check and try again.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to look up order' }, { status: 500 });
  }
}
