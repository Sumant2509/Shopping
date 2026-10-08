import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || undefined;

  const reviews = db.getReviews(productId);
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  try {
    const { productId, productName, customerName, city, rating, comment } = await request.json();

    if (!productId || !customerName || !rating || !comment) {
      return NextResponse.json({ error: 'Please provide all required review fields' }, { status: 400 });
    }

    const review = db.addReview({
      productId,
      productName: productName || 'Handmade Doormat',
      customerName,
      city: city || 'India',
      rating: Number(rating),
      comment,
      verified: true,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
