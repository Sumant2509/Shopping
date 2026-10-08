import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await verifyAdminToken(token);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customers = db.getAllCustomers().map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      isActive: c.isActive,
      addressCount: c.addresses?.length || 0,
      createdAt: c.createdAt,
      // Count their orders
      orderCount: db.getCustomerOrders(c.id).length,
    }));

    return NextResponse.json({ success: true, customers });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

// Admin can deactivate/reactivate customers
export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const admin = await verifyAdminToken(token);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { customerId, isActive } = await request.json();
    const updated = db.updateCustomer(customerId, { isActive });
    if (!updated) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
