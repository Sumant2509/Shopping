import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, verifyAdminToken } from '@/lib/auth';
import { sanitizeInput, validatePasswordComplexity } from '@/lib/security';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    const session = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const admin = db.getAdminUser('admin') || db.getAdminUser('sumantku2509@zohomail.in');
    return NextResponse.json({
      username: admin?.username || 'admin',
      email: admin?.email || 'sumantku2509@zohomail.in',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admin credentials' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    const session = adminToken ? await verifyAdminToken(adminToken) : null;
    if (!session || session.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { currentPassword, newUsername, newPassword, newEmail } = body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return NextResponse.json({ error: 'Current password is required to update credentials' }, { status: 400 });
    }

    if (!newUsername || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New username and new password are required' }, { status: 400 });
    }

    const complexity = validatePasswordComplexity(newPassword);
    if (!complexity.valid) {
      return NextResponse.json({ error: complexity.message || 'New password does not meet security requirements' }, { status: 400 });
    }

    const currentAdmin = db.getAdminUser(session.username) || db.getAdminUser('admin');
    if (!currentAdmin || !currentAdmin.passwordHash) {
      return NextResponse.json({ error: 'Admin record not found' }, { status: 404 });
    }

    // Strict password verification against bcrypt hash
    const isCurrentValid = await verifyPassword(currentPassword, currentAdmin.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    const newHash = await hashPassword(newPassword);
    const updated = db.updateAdminCredentials(newUsername.trim(), newHash, newEmail ? newEmail.trim() : undefined);

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
