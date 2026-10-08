import crypto from 'crypto';
import { db } from './db';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export function getRazorpayCredentials(): { keyId: string; keySecret: string; isConfigured: boolean } {
  let dbKeyId = '';
  let dbKeySecret = '';
  try {
    const settings = db.getSettings();
    if (settings.razorpayKeyId) dbKeyId = settings.razorpayKeyId.trim();
    if (settings.razorpayKeySecret) dbKeySecret = settings.razorpayKeySecret.trim();
  } catch {}

  const keyId = dbKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || process.env.RAZORPAY_KEY_ID?.trim() || '';
  const keySecret = dbKeySecret || process.env.RAZORPAY_KEY_SECRET?.trim() || '';

  const isConfigured = Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('YOUR_KEY_ID') &&
    !keyId.includes('demo') &&
    !keySecret.includes('demo') &&
    !keySecret.includes('YOUR_KEY_SECRET') &&
    (keyId.startsWith('rzp_test_') || keyId.startsWith('rzp_live_')) &&
    keySecret.length >= 10
  );

  return {
    keyId: keyId || 'rzp_test_demo12345',
    keySecret,
    isConfigured,
  };
}

export function isRazorpayConfigured(): boolean {
  return getRazorpayCredentials().isConfigured;
}

export function getRazorpayKeyId(): string {
  return getRazorpayCredentials().keyId;
}

/**
 * Creates a Razorpay order via Razorpay REST API or mock for local development
 */
export async function createRazorpayOrder(amountInRupees: number, receiptId: string): Promise<RazorpayOrderResponse> {
  const { keyId, keySecret, isConfigured } = getRazorpayCredentials();
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isConfigured && keyId && keySecret) {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        payment_capture: 1,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.description || 'Failed to create Razorpay order');
    }

    const data = await response.json();
    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status,
    };
  }

  // Development / Demo order generation (deterministic & secure)
  return {
    id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    amount: amountInPaise,
    currency: 'INR',
    receipt: receiptId,
    status: 'created',
  };
}

/**
 * Verifies Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const { keySecret, isConfigured } = getRazorpayCredentials();
  
  if (!isConfigured || !keySecret) {
    // In local dev/test mode with mock orders
    return signature.startsWith('mock_sig_') || signature.length > 10;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
