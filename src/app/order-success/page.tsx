'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  Truck, 
  Phone, 
  Package, 
  MapPin, 
  ArrowRight, 
  Clock, 
  Calendar,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Order } from '@/lib/types';
import { formatPrice, generateWhatsAppLink, formatDate } from '@/lib/utils';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire festive celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#b45309', '#be4727', '#10b981', '#f59e0b', '#3b82f6']
      });
    } catch (e) {
      console.error(e);
    }

    async function loadOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error('Failed to fetch order details', err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const whatsAppText = order
    ? `Namaste Sumant ji! My order #${order.orderNumber} has been placed. Please confirm dispatch details.`
    : `Namaste Sumant ji! I placed an order on your website.`;

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-craft-200 shadow-warm text-center space-y-6">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
              Order Confirmed & Sent to Workshop
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
              Thank You, {order ? order.customer.name : 'Valued Customer'}!
            </h1>
            <p className="text-sm text-craft-600 max-w-md mx-auto leading-relaxed">
              Your handcrafted doormat order has been received. Our artisan team is preparing your package with utmost care.
            </p>
          </div>

          {order ? (
            <div className="text-left bg-craft-50 p-6 rounded-2xl border border-craft-200 space-y-6">
              {/* Order Meta Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-5 border-b border-craft-200 text-xs">
                <div>
                  <span className="text-craft-500 block">Order Number</span>
                  <strong className="text-terracotta-800 font-mono text-sm">{order.orderNumber}</strong>
                </div>
                <div>
                  <span className="text-craft-500 block">Payment Method</span>
                  <strong className="text-craft-900">{order.paymentMethod} ({order.paymentStatus})</strong>
                </div>
                <div>
                  <span className="text-craft-500 block">Estimated Delivery</span>
                  <strong className="text-emerald-800">{order.estimatedDeliveryDate}</strong>
                </div>
                <div>
                  <span className="text-craft-500 block">Total Amount</span>
                  <strong className="text-craft-900 text-sm">{formatPrice(order.totalAmount)}</strong>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-3">
                  Ordered Products ({order.items.length})
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5 bg-white p-3 rounded-xl border border-craft-200">
                      <img
                        src={item.image || '/images/hero_doormat.jpg'}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover bg-craft-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-xs sm:text-sm text-craft-950 truncate">
                          {item.name}
                        </h4>
                        <p className="text-[11px] text-craft-500">
                          {item.dimensions} • Color: {item.selectedColor} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-xs text-craft-900 shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="pt-4 border-t border-craft-200 text-xs text-craft-700 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-craft-900 mb-1">
                  <MapPin className="w-4 h-4 text-terracotta-700" />
                  <span>Shipping Address</span>
                </div>
                <p>{order.customer.name} ({order.customer.phone})</p>
                <p>{order.customer.address.houseNo}, {order.customer.address.street}</p>
                {order.customer.address.landmark && <p>Landmark: {order.customer.address.landmark}</p>}
                <p>{order.customer.address.city}, {order.customer.address.state} - <strong>{order.customer.address.pincode}</strong></p>
              </div>
            </div>
          ) : (
            <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200 text-xs text-craft-600">
              <p>Order ID: <strong>{orderId || 'Generated'}</strong></p>
              <p className="mt-1">Order confirmation has been logged in our system.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
            <Link
              href={`/track-order?orderId=${encodeURIComponent(order?.orderNumber || orderId || '')}`}
              className="w-full sm:w-auto bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-7 py-3 rounded-full text-xs flex items-center justify-center gap-2 shadow-warm transition-colors"
            >
              <Truck className="w-4 h-4" />
              <span>Track Your Order</span>
            </Link>

            <a
              href={generateWhatsAppLink('918878112007', whatsAppText)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-full text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Support (+91 8878112007)</span>
            </a>

            <Link
              href="/shop"
              className="w-full sm:w-auto bg-craft-100 hover:bg-craft-200 text-craft-900 font-semibold px-6 py-3 rounded-full text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-craft-50">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center text-craft-500">
          Loading Order Confirmation...
        </div>
        <Footer />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
