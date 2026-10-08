import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const product = db.getProductBySlug(params.id) || db.getProductById(params.id);

  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json();
    const updated = db.updateProduct(params.id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const success = db.deleteProduct(params.id);
  if (!success) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
