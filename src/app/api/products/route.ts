import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shape = searchParams.get('shape');
  const search = searchParams.get('search');
  const sort = searchParams.get('sort');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const color = searchParams.get('color');

  let products = db.getProducts();

  if (shape && shape !== 'all') {
    products = products.filter(p => p.shape === shape);
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.description.toLowerCase().includes(q) ||
           p.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (color && color !== 'all') {
    products = products.filter(p => p.colors.some(c => c.toLowerCase().includes(color.toLowerCase())));
  }

  if (minPrice) {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) products = products.filter(p => p.price >= min);
  }

  if (maxPrice) {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) products = products.filter(p => p.price <= max);
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  }

  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newProduct = db.createProduct(body);
    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 400 });
  }
}
