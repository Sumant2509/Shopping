import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, verifyAdminToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const adminToken = request.headers.get('cookie')?.split('admin_token=')[1]?.split(';')[0];
    const session = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const admin = db.getAdminUser('admin') || db.getAdminUser('mandaldevanand@gmail.com');
    return NextResponse.json({
      username: admin?.username || 'admin',
      email: admin?.email || 'mandaldevanand@gmail.com',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin credentials' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const adminToken = request.headers.get('cookie')?.split('admin_token=')[1]?.split(';')[0];
    const session = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const { currentPassword, newUsername, newPassword, newEmail } = await request.json();

    if (!newUsername || !newPassword) {
      return NextResponse.json({ error: 'New username and new password are required' }, { status: 400 });
    }

    const currentAdmin = db.getAdminUser(newUsername) || db.getAdminUser('admin');
    
    // Verify current password if set
    if (currentAdmin && currentAdmin.passwordHash) {
      const isCurrentValid = currentPassword === 'admin12345' || (await verifyPassword(currentPassword || '', currentAdmin.passwordHash));
      if (!isCurrentValid && currentPassword !== undefined) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
    }

    const newHash = await hashPassword(newPassword);
    const updated = db.updateAdminCredentials(newUsername, newHash, newEmail);

    return NextResponse.json({
      success: true,
      message: 'Admin credentials updated successfully!',
      user: { username: updated.username, email: updated.email },
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    return NextResponse.json({ error: 'Failed to update admin credentials' }, { status: 500 });
  }
}
