import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifyAdminToken(token);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const admin = db.getAdminUser(payload.username) || db.getAdminUser(payload.email);

    return NextResponse.json({
      authenticated: true,
      admin: {
        id: admin?.id || payload.id,
        name: admin?.name || payload.name || 'Store Administrator',
        username: admin?.username || payload.username,
        email: admin?.email || payload.email,
        phone: admin?.phone || payload.phone,
        role: admin?.role || payload.role || 'superadmin',
      },
    });
  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
