import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const coupon = db.getCouponByCode(code);
    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
    }
    return NextResponse.json({ coupon });
  }

  // Admin access to all coupons
  const coupons = db.getCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newCoupon = db.createCoupon(body);
    return NextResponse.json({ success: true, coupon: newCoupon }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 400 });
  }
}
