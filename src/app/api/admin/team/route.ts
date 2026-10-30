import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { hashPassword, verifyAdminToken } from '@/lib/auth';
import { sanitizeInput, validatePasswordComplexity } from '@/lib/security';
import { AdminRole } from '@/lib/types';

// Helper to sanitize admin user for response (exclude passwordHash)
function sanitizeAdmin(admin: any) {
  return {
    id: admin.id,
    name: admin.name,
    username: admin.username,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    isActive: admin.isActive !== false,
    mobileVerified: admin.mobileVerified !== false,
    emailVerified: admin.emailVerified !== false,
    createdAt: admin.createdAt,
  };
}

async function getSuperAdminSession() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get('admin_token')?.value;
  if (!adminToken) return null;
  const session = await verifyAdminToken(adminToken);
  if (!session || session.role !== 'superadmin') return null;
  return session;
}

export async function GET() {
  try {
    const session = await getSuperAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const admins = db.getAdminUsers();
    return NextResponse.json({
      success: true,
      admins: admins.map(sanitizeAdmin),
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'Failed to fetch admin team' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { name, username, email, phone, role, password } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Name, Username, Email, and Password are required' },
        { status: 400 }
      );
    }

    const complexity = validatePasswordComplexity(password);
    if (!complexity.valid) {
      return NextResponse.json({ error: complexity.message || 'Password does not meet security requirements' }, { status: 400 });
    }

    // Check for existing user
    const existing = db.getAdminUser(username) || db.getAdminUser(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An admin with this username or email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const validRole: AdminRole = ['superadmin', 'manager', 'support'].includes(role)
      ? role
      : 'manager';

    const newAdmin = db.createAdminUser({
      name: name.trim(),
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || '+91 8878112007',
      role: validRole,
      passwordHash,
      isActive: true,
      mobileVerified: true,
      emailVerified: true,
    });

    return NextResponse.json({
      success: true,
      message: `Admin user '${newAdmin.name}' created successfully`,
      admin: sanitizeAdmin(newAdmin),
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: 'Failed to create admin user' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const rawBody = await request.json();
    const body = sanitizeInput(rawBody);
    const { id, name, username, email, phone, role, password, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (name) updates.name = name.trim();
    if (username) updates.username = username.toLowerCase().trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (phone) updates.phone = phone.trim();
    if (role && ['superadmin', 'manager', 'support'].includes(role)) updates.role = role;
    if (typeof isActive === 'boolean') updates.isActive = isActive;
    if (password && password.trim().length > 0) {
      const complexity = validatePasswordComplexity(password.trim());
      if (!complexity.valid) {
        return NextResponse.json({ error: complexity.message || 'Password does not meet security requirements' }, { status: 400 });
      }
      updates.passwordHash = await hashPassword(password.trim());
    }

    const updated = db.updateAdminUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Admin '${updated.name}' updated successfully`,
      admin: sanitizeAdmin(updated),
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    return NextResponse.json({ error: 'Failed to update admin user' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSuperAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Forbidden: Super Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Admin ID is required' }, { status: 400 });
    }

    // Prevent deleting self if matching
    const target = db.getAdminUser(id);
    if (!target) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    if (session.username.toLowerCase() === target.username.toLowerCase()) {
      return NextResponse.json(
        { error: 'You cannot delete your own logged-in admin account' },
        { status: 400 }
      );
    }

    try {
      db.deleteAdminUser(id);
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'Cannot delete this admin' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Admin account '${target.name}' removed successfully`,
    });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    return NextResponse.json({ error: 'Failed to remove admin user' }, { status: 500 });
  }
}
