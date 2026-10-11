import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  formatOrderStatusWhatsAppMessage,
  createCustomerWhatsAppLink,
  sendAutomatedWhatsAppNotification,
} from '@/lib/whatsapp';

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

    // Generate WhatsApp Status Update Message for Customer
    const whatsAppMessage = formatOrderStatusWhatsAppMessage(
      updated,
      updated.orderStatus,
      updated.trackingNumber,
      updated.courierPartner
    );
    const customerWhatsAppUrl = createCustomerWhatsAppLink(updated.customer.phone, whatsAppMessage);

    sendAutomatedWhatsAppNotification({
      phone: updated.customer.phone,
      message: whatsAppMessage,
    }).catch((err) => console.error('[WhatsApp Status Notify Error]:', err));

    return NextResponse.json({
      success: true,
      order: updated,
      customerWhatsAppUrl,
      whatsAppMessage,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 400 });
  }
}
