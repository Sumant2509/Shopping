'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { adminApi } from '@/lib/admin-api';
import { Order, Product } from '@/lib/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ord, prod] = await Promise.all([
          adminApi.getOrders(),
          adminApi.getProducts(),
        ]);
        setOrders(ord);
        setProducts(prod);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'PAID' ? o.totalAmount : 0),
    0
  );
  const pendingOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );
  const lowStockProducts = products.filter((p) => p.stock <= 20);

  const handleQuickStatusChange = async (
    orderId: string,
    newStatus: Order['orderStatus']
  ) => {
    await adminApi.updateOrderStatus(orderId, newStatus);
    const updated = await adminApi.getOrders();
    setOrders(updated);
  };

  return (
    <AdminLayout title="Business Dashboard">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-craft-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-craft-900 mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Paid customer orders
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-craft-500 uppercase tracking-wider">
              Pending Orders
            </p>
            <h3 className="text-2xl font-bold text-terracotta-700 mt-1">
              {pendingOrders.length}
            </h3>
            <p className="text-[11px] text-craft-500 font-medium mt-1">
              Needs packing / dispatch
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-craft-500 uppercase tracking-wider">
              Active Catalog
            </p>
            <h3 className="text-2xl font-bold text-craft-900 mt-1">
              {products.length} Products
            </h3>
            <p className="text-[11px] text-craft-500 font-medium mt-1">
              Handmade mat designs
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-craft-500 uppercase tracking-wider">
              Low Stock Alert
            </p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {lowStockProducts.length} Items
            </h3>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Stock ≤ 20 pieces
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Strip */}
      <div className="bg-gradient-to-r from-terracotta-800 to-terracotta-900 rounded-2xl p-6 text-white mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <h3 className="font-bold text-lg">Quick Storefront Actions</h3>
          <p className="text-xs text-amber-200 mt-1">
            Manage your handmade doormat inventory and dispatch incoming orders instantly.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/products"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-terracotta-900 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-100 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-terracotta-700" />
            <span>Manage Products</span>
          </Link>
          <Link
            href="/orders"
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-terracotta-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-terracotta-600 transition-colors border border-amber-300/30"
          >
            <Truck className="w-4 h-4" />
            <span>View All Orders</span>
          </Link>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-craft-200 overflow-hidden shadow-xs">
        <div className="p-6 border-b border-craft-200 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-craft-900">Recent Customer Orders</h2>
            <p className="text-xs text-craft-500 mt-0.5">
              Live incoming customer orders requiring fulfillment
            </p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-terracotta-700 hover:text-terracotta-800 flex items-center gap-1"
          >
            <span>All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-8 text-center text-sm text-craft-500">
            No orders found yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-craft-50 text-craft-600 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Items</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-craft-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-craft-900 text-xs">
                      {order.orderNumber || order.id}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-craft-900 text-xs">
                        {order.customer.fullName}
                      </p>
                      <p className="text-[11px] text-craft-500">
                        {order.customer.city}, {order.customer.state} • {order.customer.phone}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs text-craft-700">
                      {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="px-6 py-4 font-bold text-craft-900 text-xs">
                      ₹{order.totalAmount}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.paymentStatus} ({order.paymentMethod})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleQuickStatusChange(
                            order.id,
                            e.target.value as Order['orderStatus']
                          )
                        }
                        className="bg-craft-50 border border-craft-300 rounded-lg text-xs py-1 px-2 font-medium text-craft-800 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href="/orders"
                        className="text-xs text-terracotta-700 hover:text-terracotta-800 font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
