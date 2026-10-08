import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sumant_handmade_doormat_secret_key_2026_secure'
);

async function verifyToken(token: string, expectedRole: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === expectedRole;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ─── Protect Admin Routes ────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (!adminToken || !(await verifyToken(adminToken, 'admin'))) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ─── Protect Customer Account Routes ─────────────────────────────────────────
  if (pathname.startsWith('/account') &&
      !pathname.startsWith('/account/login') &&
      !pathname.startsWith('/account/register')) {
    const customerToken = request.cookies.get('customer_token')?.value;
    if (!customerToken || !(await verifyToken(customerToken, 'customer'))) {
      const loginUrl = new URL('/account/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ─── Redirect already-logged-in admin away from login page ──────────────────
  if (pathname === '/admin/login') {
    const adminToken = request.cookies.get('admin_token')?.value;
    if (adminToken && (await verifyToken(adminToken, 'admin'))) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // ─── Redirect already-logged-in customers away from login/register ───────────
  if (pathname === '/account/login' || pathname === '/account/register') {
    const customerToken = request.cookies.get('customer_token')?.value;
    if (customerToken && (await verifyToken(customerToken, 'customer'))) {
      return NextResponse.redirect(new URL('/account/profile', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/account/:path*',
  ],
};
