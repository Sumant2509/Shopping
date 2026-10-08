'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Tag, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  Phone
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import { formatPrice, generateWhatsAppLink } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    discount,
    shippingFee,
    totalAmount,
    coupon,
    couponError,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
    freeShippingRemaining,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    const result = await applyCoupon(couponInput);
    setCouponLoading(false);
    setCouponMessage(result.message);
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
        {/* Breadcrumb & Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-craft-500 mb-2">
            <Link href="/" className="hover:text-terracotta-700">Home</Link>
            <span>/</span>
            <span className="text-terracotta-800 font-semibold">Shopping Cart</span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
            Your Cart ({items.reduce((s, i) => s + i.quantity, 0)} items)
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-craft-200 shadow-sm max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-full bg-craft-100 flex items-center justify-center text-craft-400 mx-auto mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="font-serif font-bold text-xl text-craft-900 mb-2">Your cart is empty</h2>
            <p className="text-xs sm:text-sm text-craft-600 mb-8 max-w-xs mx-auto">
              You haven't added any handmade doormats yet. Explore our bestselling flower mats and braided designs!
            </p>
            <Link
              href="/shop"
              className="bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-8 py-3.5 rounded-full text-sm shadow-warm transition-all inline-flex items-center gap-2"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Items List */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free Shipping Alert Bar */}
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                {freeShippingRemaining > 0 ? (
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-terracotta-700" />
                        Add <strong className="text-terracotta-800">{formatPrice(freeShippingRemaining)}</strong> more to unlock <strong>FREE All-India Delivery</strong>
                      </span>
                      <span>{freeShippingProgress}%</span>
                    </div>
                    <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-terracotta-600 h-full rounded-full transition-all"
                        style={{ width: `${freeShippingProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>You have unlocked <strong>FREE Express Shipping</strong> on this order! 🎉</span>
                  </div>
                )}
              </div>

              {/* Items Card List */}
              <div className="bg-white rounded-3xl border border-craft-200 shadow-sm divide-y divide-craft-100 overflow-hidden">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedColor}`} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                    <img
                      src={item.image || '/images/hero_doormat.jpg'}
                      alt={item.name}
                      className="w-24 h-24 rounded-2xl object-cover bg-craft-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-serif font-bold text-base text-craft-950">
                            {item.name}
                          </h3>
                          <p className="text-xs text-craft-500 mt-0.5">
                            {item.dimensions} • Color: <span className="font-semibold text-craft-800">{item.selectedColor}</span>
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId, item.selectedColor)}
                          className="text-craft-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Stepper */}
                        <div className="flex items-center border border-craft-300 rounded-xl bg-craft-50">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor)}
                            className="p-1.5 hover:bg-craft-200 rounded-l-xl text-craft-700"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3.5 text-xs font-bold text-craft-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                            className="p-1.5 hover:bg-craft-200 rounded-r-xl text-craft-700"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="font-bold text-base text-craft-900">
                            {formatPrice(item.price * item.quantity)}
                          </div>
                          {item.mrp > item.price && (
                            <div className="text-xs text-craft-400 line-through">
                              {formatPrice(item.mrp * item.quantity)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-terracotta-700 hover:underline"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Continue Shopping</span>
                </Link>

                <button
                  onClick={clearCart}
                  className="text-xs text-craft-500 hover:text-red-600 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-craft-200 shadow-warm space-y-6">
              <h2 className="font-serif font-bold text-lg text-craft-950 pb-3 border-b border-craft-200">
                Order Summary
              </h2>

              {/* Coupon Engine */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-craft-700 mb-2">
                  Apply Discount Coupon
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                      <Tag className="w-4 h-4 text-emerald-700" />
                      <span><strong>{coupon.code}</strong> applied (-{formatPrice(discount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-red-600 hover:underline font-bold text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. WELCOME10"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-craft-300 uppercase font-mono focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p className={`text-[11px] mt-1.5 ${couponError ? 'text-red-600' : 'text-emerald-700 font-medium'}`}>
                    {couponMessage}
                  </p>
                )}

                {/* Popular coupons pill */}
                {!coupon && (
                  <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px]">
                    <span className="text-craft-400">Available:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCouponInput('WELCOME10');
                        applyCoupon('WELCOME10');
                      }}
                      className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-mono font-bold hover:bg-amber-100"
                    >
                      WELCOME10 (10% off)
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs sm:text-sm text-craft-600 pt-2 border-t border-craft-200">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
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

                <div className="border-t border-craft-200 pt-3 flex justify-between text-base font-bold text-craft-950">
                  <span>Final Total</span>
                  <span className="text-xl text-terracotta-800">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => router.push('/checkout')}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold py-3.5 rounded-full shadow-warm flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.99]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-craft-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-bit Encrypted Checkout • Safe Payment Guaranteed</span>
              </div>
            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
