'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Truck, 
  Download, 
  CheckCircle2, 
  Clock, 
  Filter, 
  MapPin, 
  Phone, 
  ExternalLink 
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Order, OrderStatus } from '@/lib/types';
import { formatPrice, formatDate, generateWhatsAppLink } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Tracking edit states
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('Delhivery Express');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, orderStatus: status } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED') => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, paymentStatus } : o))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveTracking = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackingNumber,
          courierPartner,
          orderStatus: 'SHIPPED',
        }),
      });
      if (res.ok) {
        setOrders(prev =>
          prev.map(o =>
            o.id === orderId
              ? { ...o, trackingNumber, courierPartner, orderStatus: 'SHIPPED' }
              : o
          )
        );
        setEditingTracking(null);
        setTrackingNumber('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;

    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Email', 'City', 'State', 'Pincode', 'Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Tracking Number', 'Courier'];
    const rows = orders.map(o => [
      o.orderNumber,
      formatDate(o.createdAt),
      `"${o.customer.name}"`,
      o.customer.phone,
      o.customer.email,
      `"${o.customer.address.city}"`,
      `"${o.customer.address.state}"`,
      o.customer.address.pincode,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
      o.trackingNumber || '',
      o.courierPartner || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Sumant_Crafts_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    const matchSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search) ||
      o.customer.address.city.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
              Orders & Shipments ({orders.length})
            </h1>
            <p className="text-xs sm:text-sm text-craft-600 mt-1">
              Track manufacturing, dispatch status, assign courier tracking numbers, and manage invoices.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-craft-900 hover:bg-craft-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Export Orders to CSV</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-2xl border border-craft-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-craft-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, customer, phone, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['all', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-terracotta-700 text-white shadow-sm'
                    : 'bg-craft-50 text-craft-700 hover:bg-craft-200'
                }`}
              >
                {st === 'all' ? 'All Orders' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-12 text-center text-craft-400 rounded-3xl border border-craft-200">
              Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-12 text-center text-craft-500 rounded-3xl border border-craft-200 shadow-sm">
              <ShoppingBag className="w-10 h-10 mx-auto text-craft-400 mb-2" />
              <h3 className="font-serif font-bold text-lg text-craft-900">No orders found</h3>
              <p className="text-xs text-craft-500">Try changing your search term or status filter.</p>
            </div>
          ) : (
            filtered.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-craft-200 shadow-warm space-y-4"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-craft-100">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="font-mono font-bold text-sm text-terracotta-800 bg-terracotta-50 px-3 py-1 rounded-full border border-terracotta-200">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-craft-500">{formatDate(order.createdAt)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {order.paymentMethod} • {order.paymentStatus}
                    </span>
                    {order.upiUtr && (
                      <span className="font-mono text-[10px] bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                        UTR: {order.upiUtr}
                      </span>
                    )}
                    {order.razorpayPaymentId && order.razorpayPaymentId !== order.upiUtr && (
                      <span className="font-mono text-[10px] bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold">
                        Ref: {order.razorpayPaymentId}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-craft-500">Payment:</span>
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border focus:outline-none uppercase ${
                          order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                        <option value="FAILED">FAILED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-craft-500">Order:</span>
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-craft-300 bg-craft-50 text-craft-900 focus:outline-none uppercase"
                      >
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing / Loom</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Body: Customer Details + Items */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
                  {/* Customer Info */}
                  <div className="lg:col-span-4 bg-craft-50 p-4 rounded-2xl border border-craft-200 space-y-1.5 text-craft-700">
                    <p className="font-bold text-craft-950 text-sm">{order.customer.name}</p>
                    <p className="flex items-center gap-1 text-emerald-800 font-mono">
                      <Phone className="w-3.5 h-3.5" /> +91 {order.customer.phone}
                    </p>
                    <p className="text-craft-500">{order.customer.email}</p>
                    <div className="pt-2 border-t border-craft-200 text-[11px] text-craft-600">
                      <p>{order.customer.address.houseNo}, {order.customer.address.street}</p>
                      {order.customer.address.landmark && <p>Landmark: {order.customer.address.landmark}</p>}
                      <p><strong>{order.customer.address.city}, {order.customer.address.state} - {order.customer.address.pincode}</strong></p>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="lg:col-span-5 space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-craft-100">
                        <img
                          src={it.image || '/images/hero_doormat.jpg'}
                          alt={it.name}
                          className="w-12 h-12 rounded-lg object-cover bg-craft-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-craft-900 truncate">{it.name}</h4>
                          <p className="text-[11px] text-craft-500">{it.dimensions} • Color: {it.selectedColor} • Qty: {it.quantity}</p>
                        </div>
                        <span className="font-bold text-craft-900">{formatPrice(it.price * it.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary & Tracking Form */}
                  <div className="lg:col-span-3 bg-craft-50 p-4 rounded-2xl border border-craft-200 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex justify-between text-craft-600">
                        <span>Subtotal</span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>Discount</span>
                          <span>-{formatPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-craft-600">
                        <span>Shipping</span>
                        <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm text-craft-950 pt-1 border-t border-craft-200">
                        <span>Total Amount</span>
                        <span className="text-terracotta-800">{formatPrice(order.totalAmount)}</span>
                      </div>
                      {order.upiUtr && (
                        <div className="pt-1.5 text-[11px]">
                          <span className="text-craft-400 block text-[10px]">UPI Reference / UTR:</span>
                          <strong className="font-mono text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block truncate">
                            {order.upiUtr}
                          </strong>
                        </div>
                      )}
                    </div>

                    {/* Tracking status or input */}
                    <div className="mt-3 pt-3 border-t border-craft-200">
                      {order.trackingNumber ? (
                        <div className="text-[11px] text-craft-700">
                          <span className="text-craft-400 block">AWB Tracking:</span>
                          <strong className="font-mono text-terracotta-800">{order.trackingNumber}</strong>
                          <span className="text-craft-500 block">({order.courierPartner})</span>
                        </div>
                      ) : editingTracking === order.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Enter AWB Tracking #"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-craft-300 font-mono bg-white"
                          />
                          <select
                            value={courierPartner}
                            onChange={(e) => setCourierPartner(e.target.value)}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-craft-300 bg-white"
                          >
                            <option value="Delhivery Express">Delhivery Express</option>
                            <option value="Shiprocket">Shiprocket</option>
                            <option value="BlueDart">BlueDart</option>
                            <option value="India Post Speed Post">India Post Speed Post</option>
                          </select>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveTracking(order.id)}
                              className="bg-emerald-700 text-white px-3 py-1 rounded text-xs font-bold"
                            >
                              Save AWB
                            </button>
                            <button
                              onClick={() => setEditingTracking(null)}
                              className="text-craft-500 px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingTracking(order.id);
                            setTrackingNumber('');
                          }}
                          className="w-full py-1.5 rounded-lg border border-dashed border-terracotta-400 text-terracotta-800 font-bold text-xs hover:bg-terracotta-50 flex items-center justify-center gap-1"
                        >
                          <Truck className="w-3.5 h-3.5" /> Assign AWB Tracking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
