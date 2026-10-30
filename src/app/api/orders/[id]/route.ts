import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken, verifyCustomerToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import {
  formatOrderStatusWhatsAppMessage,
  createCustomerWhatsAppLink,
  sendAutomatedWhatsAppNotification,
  sendInteractiveWhatsAppOrderUpdate,
} from '@/lib/whatsapp';

function maskPhone(phone?: string): string {
  if (!phone) return '+91 **********';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 4) return '***';
  return `+91 ${digits.slice(0, 2)}*** ***${digits.slice(-2)}`;
}

function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}***@${domain}`;
}

function maskAddress(addr?: any): any {
  if (!addr) return undefined;
  if (typeof addr === 'string') return `${addr.slice(0, 8)}... (Masked for privacy)`;
  return {
    ...addr,
    street: addr.street ? `${addr.street.slice(0, 6)}... (Protected)` : undefined,
    addressLine1: addr.addressLine1 ? `${addr.addressLine1.slice(0, 6)}... (Protected)` : undefined,
  };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const order = db.getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  const customerToken = cookieStore.get('customer_token')?.value;

  // 1. Full access for authenticated Admin
  if (adminToken && (await verifyAdminToken(adminToken))) {
    return NextResponse.json({ order });
  }

  // 2. Full access for authenticated Customer who owns the order
  if (customerToken) {
    const customer = await verifyCustomerToken(customerToken);
    if (
      customer &&
      ((order as any).customerId === customer.id ||
        order.customer.email.toLowerCase() === customer.email.toLowerCase())
    ) {
      return NextResponse.json({ order });
    }
  }

  // 3. Check if phone verification query is provided (e.g. from tracking portal)
  const url = new URL(request.url);
  const phoneParam = url.searchParams.get('phone');
  if (phoneParam) {
    const cleanParam = phoneParam.replace(/[^0-9]/g, '');
    const cleanOrderPhone = order.customer.phone.replace(/[^0-9]/g, '');
    if (cleanParam.length >= 4 && cleanOrderPhone.endsWith(cleanParam)) {
      return NextResponse.json({ order });
    }
  }

  // 4. Unauthenticated public view (e.g. checkout success redirect)
  // Mask PII (Customer phone, email, full street) to protect privacy
  const sanitizedOrder = {
    ...order,
    customer: {
      ...order.customer,
      phone: maskPhone(order.customer.phone),
      email: maskEmail(order.customer.email),
      address: maskAddress(order.customer.address),
      shippingAddress: maskAddress((order as any).shippingAddress),
    },
  };

  return NextResponse.json({ order: sanitizedOrder });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
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

    sendInteractiveWhatsAppOrderUpdate(updated, updated.orderStatus)
      .catch((err) => console.error('[WhatsApp Status Notify Error]:', err));

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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const deleted = db.deleteOrder(params.id);
  if (!deleted) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Order deleted successfully' });
}
