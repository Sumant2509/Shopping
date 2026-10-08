'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Home, ShoppingBag, Package, Truck, CheckCircle2, Clock, XCircle, ChevronRight, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/lib/types';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; bg: string }> = {
  CONFIRMED:       { label: 'Confirmed',       color: 'text-blue-700',     bg: 'bg-blue-50',    icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  PROCESSING:      { label: 'Processing',      color: 'text-amber-700',    bg: 'bg-amber-50',   icon: <Clock className="w-3.5 h-3.5" /> },
  PACKED:          { label: 'Packed',          color: 'text-purple-700',   bg: 'bg-purple-50',  icon: <Package className="w-3.5 h-3.5" /> },
  SHIPPED:         { label: 'Shipped',         color: 'text-indigo-700',   bg: 'bg-indigo-50',  icon: <Truck className="w-3.5 h-3.5" /> },
  OUT_FOR_DELIVERY:{ label: 'Out for Delivery',color: 'text-orange-700',   bg: 'bg-orange-50',  icon: <Truck className="w-3.5 h-3.5" /> },
  DELIVERED:       { label: 'Delivered',       color: 'text-green-700',    bg: 'bg-green-50',   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  CANCELLED:       { label: 'Cancelled',       color: 'text-red-700',      bg: 'bg-red-50',     icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function CustomerOrdersPage() {
  const { customer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/orders')
      .then(r => r.json())
      .then(d => { if (d.success) setOrders(d.orders); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-craft-50">
      {/* Nav */}
      <nav className="bg-white border-b border-craft-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-craft-800 font-serif font-bold text-lg">
            <Home className="w-5 h-5 text-terracotta-600" />
            Home-Warrior
          </Link>
          <Link href="/account/profile" className="flex items-center gap-1.5 text-sm text-craft-600 hover:text-terracotta-700 font-medium">
            <User className="w-4 h-4" /> {customer?.name || 'Profile'}
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/account/profile" className="p-2 rounded-xl hover:bg-white transition-colors text-craft-500 hover:text-craft-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif font-bold text-2xl text-craft-900">My Orders</h1>
            <p className="text-sm text-craft-500">{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
          </div>
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-terracotta-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-craft-100 text-center py-16 px-8">
            <ShoppingBag className="w-14 h-14 text-craft-200 mx-auto mb-4" />
            <h3 className="font-semibold text-craft-700 text-lg mb-2">No orders yet</h3>
            <p className="text-craft-400 text-sm mb-6">Your order history will appear here after your first purchase.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-terracotta-600 to-amber-600 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <ShoppingBag className="w-4 h-4" /> Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.CONFIRMED;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-craft-100 overflow-hidden">
                  {/* Order Header */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-craft-50">
                    <div>
                      <p className="font-bold text-craft-900 text-sm font-mono">{order.orderNumber}</p>
                      <p className="text-xs text-craft-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.icon}
                      {statusCfg.label}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-craft-100 overflow-hidden shrink-0">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-5 h-5 text-craft-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-craft-800 truncate">{item.name}</p>
                          <p className="text-xs text-craft-400">Qty: {item.quantity} {item.selectedColor ? `· ${item.selectedColor}` : ''}</p>
                        </div>
                        <p className="text-sm font-bold text-craft-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-5 py-3 bg-craft-50 border-t border-craft-100">
                    <div className="text-sm">
                      <span className="text-craft-500">Total: </span>
                      <span className="font-bold text-craft-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-craft-400 ml-2">({order.paymentMethod})</span>
                    </div>
                    <Link
                      href={`/track-order?order=${order.orderNumber}`}
                      className="flex items-center gap-1 text-xs font-semibold text-terracotta-600 hover:text-terracotta-800 transition-colors"
                    >
                      Track <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
