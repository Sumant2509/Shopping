'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Lock,
  Sparkles,
  Phone
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import { formatPrice } from '@/lib/utils';
import { lookupPincode } from '@/lib/shipping';
import { PaymentMethod } from '@/lib/types';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", 
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", 
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi (NCR)", "Chandigarh", "Jammu and Kashmir"
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, shippingFee, totalAmount, coupon, clearCart } = useCart();

  const COD_FEE = 40;

  // Customer Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Uttar Pradesh');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill city/state when pincode is entered
  useEffect(() => {
    if (/^\d{6}$/.test(pincode.trim())) {
      const info = lookupPincode(pincode.trim());
      if (info.isServiceable && info.city && !info.city.includes('Serviceable Area')) {
        setCity(info.city);
        if (INDIAN_STATES.includes(info.state)) {
          setState(info.state);
        }
      }
    }
  }, [pincode]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-craft-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-serif font-bold text-2xl text-craft-900 mb-2">Your cart is empty</h2>
          <p className="text-sm text-craft-600 mb-6">Please add items to your cart before proceeding to checkout.</p>
          <Link
            href="/shop"
            className="bg-terracotta-700 text-white font-bold px-6 py-2.5 rounded-full text-xs"
          >
            Explore Handcrafted Mats
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve(false);
        return;
      }
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Indian phone validation (10 digits)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    setLoading(true);

    const customerPayload = {
      name: name.trim(),
      phone: cleanPhone,
      email: email.trim(),
      address: {
        houseNo: houseNo.trim(),
        street: street.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
      },
    };

    const isCOD = paymentMethod === 'COD';
    const finalPayable = totalAmount + (isCOD ? COD_FEE : 0);

    // ─────────────────────────────────────────────────────────────
    // CASE 1: Cash on Delivery (COD)
    // ─────────────────────────────────────────────────────────────
    if (isCOD) {
      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerPayload,
            items,
            paymentMethod: 'COD',
            couponCode: coupon?.code,
            codFee: COD_FEE,
            notes: notes.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to place COD order');
        }

        clearCart();
        setLoading(false);
        router.push(`/order-success?orderId=${encodeURIComponent(data.order.orderNumber)}`);
      } catch (err: unknown) {
        console.error('COD Checkout error:', err);
        const message =
          err instanceof Error
            ? err.message
            : 'Something went wrong while processing your order. Please try again.';
        setError(message);
        setLoading(false);
      }
      return;
    }

    // ─────────────────────────────────────────────────────────────
    // CASE 2: Online Payment (UPI, Credit/Debit Card, Net Banking)
    // ─────────────────────────────────────────────────────────────
    try {
      // 1. Initialize Razorpay order on server
      const initRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalPayable,
          receipt: `rcpt_${Date.now()}`,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.orderId) {
        throw new Error(initData.error || 'Failed to initialize online payment');
      }

      const isLive = Boolean(initData.isLive);

      // Simulation mode fallback (if real Razorpay API keys are not yet configured in .env.local)
      if (!isLive && initData.orderId.startsWith('order_mock_')) {
        const confirmSimulate = window.confirm(
          `🔔 Razorpay Test Simulator:\n\nReal Razorpay API Keys are not yet configured in .env.local.\n\nSimulate successful ${paymentMethod} payment for ${formatPrice(finalPayable)} to verify complete order tracking?`
        );

        if (!confirmSimulate) {
          setLoading(false);
          return;
        }

        const mockPaymentId = `pay_mock_${Date.now()}`;
        const mockSig = `mock_sig_${Math.random().toString(36).substring(2, 12)}`;

        const orderRes = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: customerPayload,
            items,
            paymentMethod,
            couponCode: coupon?.code,
            notes: notes.trim(),
            razorpayOrderId: initData.orderId,
            razorpayPaymentId: mockPaymentId,
            razorpaySignature: mockSig,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok || !orderData.success) {
          throw new Error(orderData.error || 'Order placement failed');
        }

        clearCart();
        setLoading(false);
        router.push(`/order-success?orderId=${encodeURIComponent(orderData.order.orderNumber)}`);
        return;
      }

      // 2. Ensure Razorpay Checkout SDK is ready in browser
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !(window as any).Razorpay) {
        throw new Error('Razorpay checkout window could not be opened. Please disable popup blockers and try again.');
      }

      // 3. Launch official Razorpay payment modal with UPI, Cards, NetBanking
      const options = {
        key: initData.keyId,
        amount: initData.amount,
        currency: initData.currency || 'INR',
        name: 'Sumant Crafts',
        description: 'Handmade Doormats Order',
        image: '/images/hero_doormat.jpg',
        order_id: initData.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: cleanPhone,
        },
        notes: {
          address: `${houseNo}, ${street}, ${city}, ${state} - ${pincode}`,
        },
        theme: {
          color: '#993d20', // Artisanal Terracotta brand accent
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setLoading(true);

            // Step 4: Verify payment signature and record confirmed order
            const orderRes = await fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: customerPayload,
                items,
                paymentMethod,
                couponCode: coupon?.code,
                notes: notes.trim(),
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok || !orderData.success) {
              throw new Error(orderData.error || 'Payment succeeded, but recording order failed. Please contact support.');
            }

            clearCart();
            setLoading(false);
            router.push(`/order-success?orderId=${encodeURIComponent(orderData.order.orderNumber)}`);
          } catch (err: unknown) {
            console.error('Order creation error post-payment:', err);
            const msg = err instanceof Error ? err.message : 'Error finalizing order';
            setError(msg);
            setLoading(false);
          }
        },
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.on('payment.failed', function (resp: any) {
        setError(resp.error?.description || 'Payment was declined or cancelled.');
        setLoading(false);
      });

      rzpInstance.open();
    } catch (err: unknown) {
      console.error('Online checkout error:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong while processing your payment. Please try again.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb & Security Trust */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-craft-500 mb-1">
              <Link href="/cart" className="hover:text-terracotta-700 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
              </Link>
              <span>/</span>
              <span className="text-terracotta-800 font-semibold">Secure Indian Checkout</span>
            </div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
              Delivery & Payment Details
            </h1>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-800 self-start sm:self-auto">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>256-Bit SSL Encrypted & Verified</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-2 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 7 Columns: Delivery Address & Payment */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Contact & Delivery Address */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-craft-200">
                  <div className="w-7 h-7 rounded-full bg-terracotta-700 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h2 className="font-serif font-bold text-lg text-craft-950">
                    Contact & Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sumant Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      Mobile Number (For Courier SMS/Updates) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-craft-500">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-11 pr-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">
                    Email Address (For Invoice & Tracking) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. yourname@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      Flat / House No. / Building *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Sai Residency"
                      value={houseNo}
                      onChange={(e) => setHouseNo(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      Street / Area / Colony *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5th Main, Sector 12"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="6-digit PIN"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      City / District *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bhilai"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">
                      State *
                    </label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 bg-white"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Shiv Mandir / Opp. Community Center"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>
              </div>

              {/* 2. Payment Method */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-craft-200">
                  <div className="w-7 h-7 rounded-full bg-terracotta-700 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h2 className="font-serif font-bold text-lg text-craft-950">
                    Choose Payment Option
                  </h2>
                </div>

                <div className="space-y-3">
                  {/* UPI */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'UPI'
                        ? 'border-terracotta-600 bg-terracotta-50/70 ring-2 ring-terracotta-400'
                        : 'border-craft-200 hover:border-craft-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'UPI'}
                      onChange={() => setPaymentMethod('UPI')}
                      className="mt-1 text-terracotta-700 focus:ring-terracotta-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-terracotta-700" />
                          <span className="font-bold text-xs sm:text-sm text-craft-900">
                            UPI (Google Pay / PhonePe / Paytm / BHIM)
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Fastest
                        </span>
                      </div>
                      <p className="text-[11px] text-craft-500 mt-1">
                        Pay instantly via any UPI App or Scan QR Code securely.
                      </p>
                    </div>
                  </label>

                  {/* Cards */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'CARD'
                        ? 'border-terracotta-600 bg-terracotta-50/70 ring-2 ring-terracotta-400'
                        : 'border-craft-200 hover:border-craft-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="mt-1 text-terracotta-700 focus:ring-terracotta-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-terracotta-700" />
                        <span className="font-bold text-xs sm:text-sm text-craft-900">
                          Credit & Debit Cards (RuPay, Visa, Mastercard)
                        </span>
                      </div>
                      <p className="text-[11px] text-craft-500 mt-1">
                        All Indian & International bank cards supported with OTP verification.
                      </p>
                    </div>
                  </label>

                  {/* Net Banking */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'NETBANKING'
                        ? 'border-terracotta-600 bg-terracotta-50/70 ring-2 ring-terracotta-400'
                        : 'border-craft-200 hover:border-craft-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'NETBANKING'}
                      onChange={() => setPaymentMethod('NETBANKING')}
                      className="mt-1 text-terracotta-700 focus:ring-terracotta-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-terracotta-700" />
                        <span className="font-bold text-xs sm:text-sm text-craft-900">
                          Net Banking (SBI, HDFC, ICICI, Axis & 50+ Banks)
                        </span>
                      </div>
                      <p className="text-[11px] text-craft-500 mt-1">
                        Direct bank-to-bank transfer through secure gateway.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border cursor-pointer transition-all ${
                      paymentMethod === 'COD'
                        ? 'border-terracotta-600 bg-terracotta-50/70 ring-2 ring-terracotta-400'
                        : 'border-craft-200 hover:border-craft-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mt-1 text-terracotta-700 focus:ring-terracotta-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-terracotta-700" />
                        <span className="font-bold text-xs sm:text-sm text-craft-900">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      <p className="text-[11px] text-craft-500 mt-1">
                        Pay cash or scan courier QR code upon doorstep delivery.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-3xl p-6 border border-craft-200 shadow-sm">
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Delivery Instructions / Special Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please call before delivery, leave with security if unavailable..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                />
              </div>

            </div>

            {/* Right 5 Columns: Order Review & Submit */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-warm space-y-6 sticky top-24">
              <h2 className="font-serif font-bold text-lg text-craft-950 pb-3 border-b border-craft-200">
                Order Review ({items.length} items)
              </h2>

              {/* Items summary */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-craft-100">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedColor}`} className="pt-3 first:pt-0 flex items-center gap-3">
                    <img
                      src={item.image || '/images/hero_doormat.jpg'}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover bg-craft-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-craft-900 truncate">{item.name}</h4>
                      <p className="text-[11px] text-craft-500">
                        {item.dimensions} • {item.selectedColor} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-craft-900 shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-xs sm:text-sm text-craft-600 pt-3 border-t border-craft-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-craft-900">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount ({coupon?.code})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-craft-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-xs">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>

                {paymentMethod === 'COD' && (
                  <div className="flex justify-between text-amber-700">
                    <span>COD Handling Fee</span>
                    <span className="font-semibold">+{formatPrice(COD_FEE)}</span>
                  </div>
                )}

                <div className="border-t border-craft-200 pt-3 flex justify-between text-base font-bold text-craft-950">
                  <span>Total Payable Amount</span>
                  <span className="text-xl text-terracotta-800">
                    {formatPrice(totalAmount + (paymentMethod === 'COD' ? COD_FEE : 0))}
                  </span>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-4 rounded-full shadow-warm flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.99]"
              >
                {loading ? (
                  <span>Processing Order...</span>
                ) : paymentMethod === 'COD' ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Place Cash on Delivery Order ({formatPrice(totalAmount + COD_FEE)})</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay Online via {paymentMethod === 'UPI' ? 'UPI (GPay / PhonePe / Paytm)' : paymentMethod} ({formatPrice(totalAmount)})</span>
                  </>
                )}
              </button>

              <div className="space-y-2 text-[11px] text-craft-500 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-800 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Buyer Protection & Money Back Guarantee</span>
                </div>
                <p>Direct manufacture & dispatch from Home Warrior Workshop, Bhilai, Durg (Chhattisgarh)</p>
              </div>
            </div>

          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
