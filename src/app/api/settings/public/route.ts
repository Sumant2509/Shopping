import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isRazorpayConfigured, getRazorpayKeyId } from '@/lib/razorpay';

export async function GET() {
  try {
    const settings = db.getSettings();
    return NextResponse.json({
      storeName: settings.storeName || 'Home-Warrior',
      upiId: settings.upiId || '8878112007@upi',
      upiMerchantName: settings.upiMerchantName || 'Home-Warrior',
      enableUpiPayment: settings.enableUpiPayment ?? true,
      enableCOD: settings.enableCOD ?? true,
      codFee: settings.codFee ?? 40,
      freeShippingThreshold: settings.freeShippingThreshold ?? 699,
      flatShippingRate: settings.flatShippingRate ?? 60,
      whatsappNumber: settings.whatsappNumber || '+91 8878112007',
      supportPhone: settings.supportPhone || '+91 8878112007',
      supportEmail: settings.supportEmail || 'mandaldevanand@gmail.com',
      isRazorpayLive: isRazorpayConfigured(),
      razorpayKeyId: getRazorpayKeyId(),
    });
  } catch (error) {
    console.error('Error fetching public settings:', error);
    return NextResponse.json(
      {
        storeName: 'Home-Warrior',
        upiId: '8878112007@upi',
        upiMerchantName: 'Home-Warrior',
        enableUpiPayment: true,
        enableCOD: true,
        codFee: 40,
        freeShippingThreshold: 699,
        flatShippingRate: 60,
        whatsappNumber: '+91 8878112007',
        supportPhone: '+91 8878112007',
        supportEmail: 'mandaldevanand@gmail.com',
        isRazorpayLive: false,
        razorpayKeyId: 'rzp_test_demo12345',
      },
      { status: 200 }
    );
  }
}
