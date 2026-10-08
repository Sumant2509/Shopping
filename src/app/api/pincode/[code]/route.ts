import { NextResponse } from 'next/server';
import { lookupPincode } from '@/lib/shipping';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  const info = lookupPincode(code);

  if (!info.isServiceable) {
    return NextResponse.json({
      isServiceable: false,
      message: 'Please enter a valid 6-digit Indian PIN code',
    }, { status: 400 });
  }

  return NextResponse.json({
    ...info,
    message: `Delivery available in ${info.deliveryDays} business days to ${info.city}, ${info.state}`,
  });
}
