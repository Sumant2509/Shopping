import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sumant_handmade_doormat_secret_key_2026_secure'
);

// ─── Password Utilities ───────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── ADMIN AUTH ───────────────────────────────────────────────────────────────

export async function signAdminToken(adminPayload: { username: string; email: string }): Promise<string> {
  return new SignJWT({ ...adminPayload, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string): Promise<{ username: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === 'admin') {
      return {
        username: payload.username as string,
        email: payload.email as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── CUSTOMER AUTH ────────────────────────────────────────────────────────────

export async function signCustomerToken(customerPayload: {
  id: string;
  name: string;
  email: string;
}): Promise<string> {
  return new SignJWT({ ...customerPayload, role: 'customer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

export async function verifyCustomerToken(
  token: string
): Promise<{ id: string; name: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role === 'customer') {
      return {
        id: payload.id as string,
        name: payload.name as string,
        email: payload.email as string,
      };
    }
    return null;
  } catch {
    return null;
  }
}
