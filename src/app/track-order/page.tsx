'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  Phone, 
  Box, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, generateWhatsAppLink, formatDate } from '@/lib/utils';

const STATUS_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'CONFIRMED', label: 'Order Confirmed', desc: 'Order received & allocated to artisan loom' },
  { status: 'PROCESSING', label: 'Processing & Stitching', desc: 'Quality inspection & finishing' },
  { status: 'PACKED', label: 'Packed & Ready', desc: 'Securely packed in protective eco-friendly wrap' },
  { status: 'SHIPPED', label: 'Shipped via Courier', desc: 'Handed over to courier partner for transit' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Courier agent out for doorstep delivery' },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Safely delivered to your home' },
];

function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case 'CONFIRMED': return 0;
    case 'PROCESSING': return 1;
    case 'PACKED': return 2;
    case 'SHIPPED': return 3;
    case 'OUT_FOR_DELIVERY': return 4;
    case 'DELIVERED': return 5;
    case 'CANCELLED': return -1;
    default: return 0;
  }
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderId);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialOrderId) {
      handleAutoLookup(initialOrderId);
    }
  }, [initialOrderId]);

  const handleAutoLookup = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.order) {
        setOrder(data.order);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your Order Number (e.g. SKM-2026-1082)');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNumber.trim(),
          phone: phone.trim() || '0000',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.order) {
        setError(data.error || 'No matching order found. Please verify the order number.');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Failed to fetch tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-10">
          <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
            Real-time Status
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
            Track Your Handcrafted Order
          </h1>
          <p className="text-xs sm:text-sm text-craft-600 mt-2">
            Enter your Order Number and Mobile Number to view live dispatch and delivery updates.
          </p>
        </div>

        {/* Tracking Lookup Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-warm mb-10">
          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-craft-700 mb-1">
                Order Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SKM-2026-1082"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-craft-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {loading ? 'Searching...' : 'Track'}
              </button>
            </div>
          </form>

          {/* Quick Demo Hint */}
          <div className="mt-4 pt-3 border-t border-craft-100 flex items-center justify-between text-[11px] text-craft-500">
            <span>Sample Demo Orders:</span>
            <div className="flex gap-2 font-mono text-terracotta-700">
              <button
                type="button"
                onClick={() => {
                  setOrderNumber('SKM-2026-1082');
                  setPhone('9876543210');
                }}
                className="hover:underline font-bold"
              >
                SKM-2026-1082
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => {
                  setOrderNumber('SKM-2026-1083');
                  setPhone('9811223344');
                }}
                className="hover:underline font-bold"
              >
                SKM-2026-1083
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-2 text-xs font-medium mb-10">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Order Timeline */}
        {order && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-warm space-y-8 animate-fadeIn">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-craft-200">
              <div>
                <span className="text-[11px] font-mono font-bold text-terracotta-700 bg-terracotta-50 px-2.5 py-1 rounded-full border border-terracotta-200">
                  {order.orderNumber}
                </span>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-craft-950 mt-2">
                  Order Status: <span className="text-terracotta-800 uppercase">{order.orderStatus.replace(/_/g, ' ')}</span>
                </h2>
                <p className="text-xs text-craft-500 mt-0.5">
                  Placed on {formatDate(order.createdAt)} • Recipient: <strong>{order.customer.name}</strong>
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-xs text-emerald-900">
                <span className="block text-[10px] text-emerald-700 uppercase font-bold">Estimated Delivery</span>
                <strong className="text-sm">{order.estimatedDeliveryDate}</strong>
              </div>
            </div>

            {/* Courier & Tracking Details */}
            {order.trackingNumber && (
              <div className="bg-craft-50 p-4 rounded-2xl border border-craft-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-terracotta-700 text-white flex items-center justify-center shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-craft-500 block">Courier Partner</span>
                    <strong className="text-craft-900">{order.courierPartner || 'Delhivery Express'}</strong>
                  </div>
                </div>

                <div>
                  <span className="text-craft-500 block">Tracking Number (AWB)</span>
                  <strong className="font-mono text-terracotta-800">{order.trackingNumber}</strong>
                </div>
              </div>
            )}

            {/* Visual Step Tracker */}
            <div className="py-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-6">
                Shipment Progression
              </h3>

              <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-6 gap-2 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.status} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2 relative group">
                      {/* Step Circle */}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all z-10 ${
                          isDone
                            ? 'bg-terracotta-700 text-white shadow-sm ring-4 ring-terracotta-100'
                            : 'bg-craft-100 text-craft-400 border border-craft-300'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>

                      {/* Content */}
                      <div>
                        <h4 className={`text-xs font-bold ${isCurrent ? 'text-terracotta-800' : isDone ? 'text-craft-900' : 'text-craft-400'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-craft-500 mt-0.5 line-clamp-2 max-w-[120px]">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Items Summary in this shipment */}
            <div className="pt-6 border-t border-craft-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-3">
                Items in this Shipment ({order.items.length})
              </h3>
              <div className="space-y-2">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-craft-50 p-2.5 rounded-xl border border-craft-200 text-xs">
                    <img
                      src={it.image || '/images/hero_doormat.jpg'}
                      alt={it.name}
                      className="w-12 h-12 rounded-lg object-cover bg-craft-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-craft-900 truncate">{it.name}</h5>
                      <p className="text-[10px] text-craft-500">{it.dimensions} • {it.selectedColor} • Qty: {it.quantity}</p>
                    </div>
                    <span className="font-bold text-craft-900">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Support Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60">
              <span className="text-amber-950 font-medium">Need immediate updates on your package?</span>
              <a
                href={generateWhatsAppLink('918878112007', `Namaste Sumant ji! Please update me on tracking for #${order.orderNumber}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Ask on WhatsApp</span>
              </a>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-craft-50">
        <Header />
        <div className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center text-craft-500">
          Loading Order Tracker...
        </div>
        <Footer />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
