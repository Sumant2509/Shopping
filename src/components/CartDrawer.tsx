'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Tag, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Phone
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { formatPrice, generateWhatsAppLink } from '@/lib/utils';

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
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

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponMessage(null);
    const result = await applyCoupon(couponInput);
    setCouponLoading(false);
    setCouponMessage(result.message);
  };

  const handleCheckout = () => {
    setIsCartDrawerOpen(false);
    router.push('/checkout');
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  // Build WhatsApp cart text
  const itemsText = items.map(i => `• ${i.name} (${i.selectedColor || 'Standard'}) x ${i.quantity} = ₹${i.price * i.quantity}`).join('\n');
  const cartWhatsAppMessage = `Namaste Sumant ji! I want to order the following handmade mats from my cart:\n\n${itemsText}\n\nSubtotal: ₹${subtotal}\nTotal: ₹${totalAmount}\n\nPlease confirm availability!`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="fixed inset-0 bg-craft-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-5 py-4 border-b border-craft-200 flex items-center justify-between bg-craft-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-terracotta-700" />
              <h2 className="font-serif font-bold text-lg text-craft-900">Your Shopping Cart</h2>
              <span className="bg-terracotta-100 text-terracotta-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-lg text-craft-500 hover:text-craft-900 hover:bg-craft-200 transition-colors"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-amber-50/80 px-5 py-3 border-b border-amber-200/60">
            {freeShippingRemaining > 0 ? (
              <div>
                <p className="text-xs text-amber-900 font-medium flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-terracotta-700" />
                    Add <strong className="text-terracotta-800">{formatPrice(freeShippingRemaining)}</strong> more for <strong>FREE Shipping</strong>!
                  </span>
                  <span className="text-[11px] font-bold text-terracotta-700">{freeShippingProgress}%</span>
                </p>
                <div className="w-full bg-amber-200/80 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-terracotta-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Congratulations! You have unlocked <strong>FREE Express Delivery</strong> 🎉
              </p>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-craft-500">
                <div className="w-16 h-16 rounded-full bg-craft-100 flex items-center justify-center text-craft-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-craft-800 text-lg mb-1">Your cart is empty</h3>
                <p className="text-xs text-craft-500 max-w-xs mb-6">
                  Discover our bestselling handmade flower mats and braided doorstep rugs.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    router.push('/shop');
                  }}
                  className="bg-terracotta-700 hover:bg-terracotta-800 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors shadow-warm"
                >
                  Explore Handcrafted Mats
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.productId}-${item.selectedColor}`}
                  className="flex gap-3.5 p-3 rounded-xl border border-craft-200 bg-white hover:border-craft-300 transition-colors"
                >
                  <img
                    src={item.image || '/images/hero_doormat.jpg'}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover bg-craft-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-serif font-bold text-craft-900 text-sm truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId, item.selectedColor)}
                          className="text-craft-400 hover:text-red-600 p-0.5 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-craft-500 mt-0.5">
                        {item.dimensions} • <span className="font-medium text-craft-700">{item.selectedColor}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-craft-300 rounded-lg bg-craft-50">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.selectedColor)}
                          className="p-1 hover:bg-craft-200 rounded-l-lg text-craft-700 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-craft-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.selectedColor)}
                          className="p-1 hover:bg-craft-200 rounded-r-lg text-craft-700 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <span className="font-bold text-sm text-craft-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        {item.mrp > item.price && (
                          <div className="text-[10px] text-craft-400 line-through">
                            {formatPrice(item.mrp * item.quantity)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer (Coupons & Totals) */}
          {items.length > 0 && (
            <div className="border-t border-craft-200 p-5 bg-craft-50 space-y-4">
              {/* Coupon Form */}
              <div>
                {coupon ? (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 px-3 py-2 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-medium">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Code <strong>{coupon.code}</strong> applied (-{formatPrice(discount)})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-red-600 font-bold ml-2 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. WELCOME10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-craft-300 text-xs uppercase focus:outline-none focus:ring-1 focus:ring-terracotta-600"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="bg-craft-800 hover:bg-craft-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMessage && (
                  <p className={`text-[11px] mt-1 ${couponError ? 'text-red-600' : 'text-emerald-700 font-medium'}`}>
                    {couponMessage}
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-craft-600">
                <div className="flex justify-between">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-craft-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-craft-900">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold uppercase text-[11px]">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t border-craft-200 pt-2 flex justify-between text-sm font-bold text-craft-900">
                  <span>Total Amount</span>
                  <span className="text-base text-terracotta-800">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold py-3 rounded-xl shadow-warm flex items-center justify-center gap-2 text-sm transition-all active:scale-[0.99]"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href={generateWhatsAppLink('918878112007', cartWhatsAppMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl flex items-center justify-center gap-2 text-xs transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Order Entire Cart on WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-craft-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted 256-bit Secure Checkout • 100% Authentic</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
