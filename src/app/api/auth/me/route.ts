import { NextRequest, NextResponse } from 'next/server';
import { verifyCustomerToken } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyCustomerToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const customer = db.getCustomerById(payload.id);
    if (!customer || !customer.isActive) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        addresses: customer.addresses,
        createdAt: customer.createdAt,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

// Update profile
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyCustomerToken(token);
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, phone, addresses } = body;

    const updated = db.updateCustomer(payload.id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(addresses !== undefined && { addresses }),
    });

    if (!updated) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    return NextResponse.json({ success: true, customer: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      addresses: updated.addresses,
      createdAt: updated.createdAt,
    }});
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
