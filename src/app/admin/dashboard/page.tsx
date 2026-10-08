'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  Truck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  PlusCircle, 
  Clock, 
  Star,
  Users
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Order, Product } from '@/lib/types';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [ordRes, prodRes] = await Promise.all([
          fetch('/api/orders'),
          fetch('/api/products'),
        ]);

        const ordData = await ordRes.json();
        const prodData = await prodRes.json();

        if (ordData.orders) setOrders(ordData.orders);
        if (prodData.products) setProducts(prodData.products);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0), 0);
  const pendingOrders = orders.filter(o => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED');
  const lowStockProducts = products.filter(p => p.stock <= 20);

  const handleUpdateStatus = async (orderId: string, newStatus: Order['orderStatus']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
              Workshop Overview
            </h1>
            <p className="text-xs sm:text-sm text-craft-600 mt-1">
              Welcome back, Sumant Kumar! Here is your live manufacturing & sales pulse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products/new"
              className="bg-terracotta-700 hover:bg-terracotta-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Mat</span>
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-2xl border border-craft-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-craft-500 uppercase tracking-wider">Total Sales</span>
              <p className="font-serif font-bold text-xl text-craft-950 mt-0.5">{formatPrice(totalRevenue)}</p>
              <span className="text-[10px] text-emerald-700 font-semibold">Online & Delivered</span>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-5 rounded-2xl border border-craft-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-terracotta-100 text-terracotta-800 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-craft-500 uppercase tracking-wider">Total Orders</span>
              <p className="font-serif font-bold text-xl text-craft-950 mt-0.5">{orders.length}</p>
              <span className="text-[10px] text-terracotta-700 font-semibold">{pendingOrders.length} in transit / prep</span>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white p-5 rounded-2xl border border-craft-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-craft-500 uppercase tracking-wider">Active Designs</span>
              <p className="font-serif font-bold text-xl text-craft-950 mt-0.5">{products.length} Shapes</p>
              <span className="text-[10px] text-blue-700 font-semibold">100% Handcrafted</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-craft-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-craft-500 uppercase tracking-wider">Low Stock Watch</span>
              <p className="font-serif font-bold text-xl text-craft-950 mt-0.5">{lowStockProducts.length}</p>
              <span className="text-[10px] text-amber-800 font-semibold">Need Loom Restock</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-3xl border border-craft-200 shadow-warm overflow-hidden mb-8">
          <div className="p-6 border-b border-craft-200 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-lg text-craft-950">Recent Customer Orders</h2>
              <p className="text-xs text-craft-500">Manage orders, update courier tracking, and update status</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-craft-50 border-b border-craft-200 text-craft-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Order #</th>
                  <th className="py-3.5 px-5">Customer & City</th>
                  <th className="py-3.5 px-5">Products</th>
                  <th className="py-3.5 px-5">Amount</th>
                  <th className="py-3.5 px-5">Payment</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-100 text-craft-700 font-medium">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-craft-400">No orders placed yet.</td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="hover:bg-craft-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-terracotta-800">{order.orderNumber}</span>
                        <span className="block text-[10px] text-craft-400">{formatDate(order.createdAt)}</span>
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-bold text-craft-900">{order.customer.name}</p>
                        <p className="text-[11px] text-craft-500">{order.customer.address.city}, {order.customer.address.state}</p>
                        <span className="text-[10px] text-craft-400 font-mono">+91 {order.customer.phone}</span>
                      </td>

                      <td className="py-4 px-5">
                        <p className="font-semibold text-craft-900 line-clamp-1">{order.items[0]?.name}</p>
                        {order.items.length > 1 && (
                          <span className="text-[10px] text-craft-500">+{order.items.length - 1} more item(s)</span>
                        )}
                      </td>

                      <td className="py-4 px-5 font-bold text-craft-900">
                        {formatPrice(order.totalAmount)}
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {order.paymentMethod} ({order.paymentStatus})
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="bg-terracotta-50 text-terracotta-900 border border-terracotta-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {order.orderStatus.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as Order['orderStatus'])}
                          className="px-2 py-1 bg-white border border-craft-300 rounded text-xs focus:outline-none"
                        >
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="PACKED">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Section */}
        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-base">Low Stock Alert on Loom Items</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-craft-900">{p.name}</h4>
                    <span className="text-[11px] text-amber-800 font-semibold">{p.stock} units remaining</span>
                  </div>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-xs text-terracotta-700 font-bold hover:underline"
                  >
                    Edit Stock →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
