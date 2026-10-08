import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  const settings = db.getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const updated = db.updateSettings(updates);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update site settings' }, { status: 400 });
  }
}
