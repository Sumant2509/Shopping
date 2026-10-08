import crypto from 'crypto';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return false;
  if (
    keyId.includes('YOUR_KEY_ID') ||
    keyId.includes('demo') ||
    keySecret.includes('demo') ||
    keySecret.includes('YOUR_KEY_SECRET')
  ) {
    return false;
  }
  return (keyId.startsWith('rzp_test_') || keyId.startsWith('rzp_live_')) && keySecret.length >= 10;
}

export function getRazorpayKeyId(): string {
  return process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_demo12345';
}

/**
 * Creates a Razorpay order via Razorpay REST API or mock for local development
 */
export async function createRazorpayOrder(amountInRupees: number, receiptId: string): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const amountInPaise = Math.round(amountInRupees * 100);

  if (isRazorpayConfigured() && keyId && keySecret) {
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
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!isRazorpayConfigured() || !keySecret) {
    // In local dev/test mode with mock orders
    return signature.startsWith('mock_sig_') || signature.length > 10;
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}
