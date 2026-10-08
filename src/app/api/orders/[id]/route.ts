import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const order = db.getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ order });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderStatus, trackingNumber, courierPartner, paymentStatus } = await request.json();
    const updated = db.updateOrderStatus(
      params.id,
      orderStatus,
      trackingNumber,
      courierPartner,
      paymentStatus
    );

    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 400 });
  }
}
