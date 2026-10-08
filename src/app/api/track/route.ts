import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { orderNumber, phone } = await request.json();

    if (!orderNumber || !phone) {
      return NextResponse.json({ error: 'Please enter both Order ID and Mobile Number' }, { status: 400 });
    }

    const order = db.lookupOrder(orderNumber, phone);

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
