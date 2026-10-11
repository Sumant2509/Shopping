'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Printer, ShoppingBag, Loader2 } from 'lucide-react';
import { Order } from '@/lib/types';
import { ShippingLabel } from '@/components/ShippingLabel';

export default function OrderShippingLabelPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const autoPrint = searchParams.get('print') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        if (data.order) {
          setOrder(data.order);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (order && autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [order, autoPrint]);

  if (loading) {
    return (
      <div className="min-h-screen bg-craft-100 flex items-center justify-center text-craft-700 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-terracotta-700" />
        <span className="font-bold text-sm">Generating Shipping Label & Invoice...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-craft-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-craft-200 shadow-md text-center max-w-md space-y-4">
          <ShoppingBag className="w-12 h-12 text-craft-400 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-craft-950">Label Not Found</h2>
          <p className="text-xs text-craft-600">Could not retrieve order details for #{orderId}</p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta-700 text-white font-bold text-xs shadow-warm hover:bg-terracotta-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Orders</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 print:bg-white print:p-0">
      {/* Top Navigation Bar (Hidden in Print) */}
      <div className="max-w-[700px] mx-auto mb-4 flex items-center justify-between print:hidden">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-craft-700 hover:text-terracotta-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Admin Orders</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-md transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>Print Label (Ctrl + P)</span>
        </button>
      </div>

      {/* The Printable Label Component */}
      <ShippingLabel order={order} isModal={false} />
    </div>
  );
}
