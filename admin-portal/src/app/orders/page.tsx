'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Download,
  Truck,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  X,
  ExternalLink
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { adminApi } from '@/lib/admin-api';
import { Order } from '@/lib/types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Dispatch modal state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [courier, setCourier] = useState('Delhivery');
  const [trackingNumber, setTrackingNumber] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    const data = await adminApi.getOrders();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: Order['orderStatus']) => {
    await adminApi.updateOrderStatus(orderId, newStatus);
    await loadOrders();
  };

  const handleOpenDispatch = (order: Order) => {
    setDispatchOrderId(order.id);
    setCourier(order.courierPartner || 'Delhivery');
    setTrackingNumber(order.trackingNumber || `DLH-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setDispatchModalOpen(true);
  };

  const handleSaveDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrderId) return;
    await adminApi.updateOrderStatus(dispatchOrderId, 'SHIPPED', courier, trackingNumber);
    setDispatchModalOpen(false);
    await loadOrders();
  };

  const handleExportCSV = () => {
    const headers = ['Order ID,Customer,Phone,City,State,Total,Payment,Status,Tracking,Date\n'];
    const rows = orders.map(
      (o) =>
        `"${o.orderNumber || o.id}","${o.customer.fullName}","${o.customer.phone}","${o.customer.city}","${o.customer.state}",${o.totalAmount},"${o.paymentMethod}","${o.orderStatus}","${o.trackingNumber || ''}","${o.createdAt}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.phone.includes(search);
    const matchesStatus = selectedStatus === 'all' || o.orderStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout title="Customer Orders Fulfillment">
      {/* Header with Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-craft-900">
            Total Orders ({filtered.length})
          </h2>
          <p className="text-xs text-craft-500">
            Track order delivery pipelines, update status, and assign AWB courier tracking.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-craft-900 hover:bg-craft-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Strip */}
      <div className="bg-white p-4 rounded-2xl border border-craft-200 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-craft-200 rounded-xl text-xs text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? 'bg-terracotta-600 text-white font-bold'
                    : 'bg-craft-50 text-craft-700 hover:bg-craft-100'
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-craft-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-craft-50 text-craft-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Order ID & Date</th>
                <th className="px-6 py-3.5">Customer & Address</th>
                <th className="px-6 py-3.5">Products Ordered</th>
                <th className="px-6 py-3.5">Amount & Payment</th>
                <th className="px-6 py-3.5">Fulfillment Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-craft-100">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-craft-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-xs text-craft-900">
                      {order.orderNumber || order.id}
                    </p>
                    <p className="text-[11px] text-craft-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-[10px] text-blue-700 font-mono mt-1 bg-blue-50 px-2 py-0.5 rounded inline-block">
                        {order.courierPartner}: {order.trackingNumber}
                      </p>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-semibold text-xs text-craft-900">
                      {order.customer.fullName}
                    </p>
                    <p className="text-[11px] text-craft-600">
                      {order.customer.phone}
                    </p>
                    <p className="text-[11px] text-craft-500 truncate max-w-xs">
                      {order.customer.city}, {order.customer.state} - {order.customer.pincode}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-xs">
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-craft-800">
                          <strong>{item.quantity}x</strong> {item.name}
                        </li>
                      ))}
                    </ul>
                  </td>

                  <td className="px-6 py-4 text-xs">
                    <p className="font-bold text-craft-900">₹{order.totalAmount}</p>
                    <span
                      className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus} • {order.paymentMethod}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs">
                    <select
                      value={order.orderStatus}
                      onChange={(e) =>
                        handleStatusChange(order.id, e.target.value as Order['orderStatus'])
                      }
                      className="bg-craft-50 border border-craft-300 rounded-lg text-xs py-1.5 px-2.5 font-medium text-craft-900 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
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
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDispatch(order)}
                        className="px-3 py-1 bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-700 rounded-lg text-xs font-semibold flex items-center gap-1 border border-terracotta-200"
                        title="Dispatch Courier"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch</span>
                      </button>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1 text-craft-700 hover:bg-craft-100 rounded-lg text-xs font-medium"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {dispatchModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="font-bold text-base text-craft-900 mb-1">
              Dispatch Order & Assign Courier
            </h3>
            <p className="text-xs text-craft-500 mb-4">
              Enter courier partner and AWB Tracking ID to notify the customer.
            </p>

            <form onSubmit={handleSaveDispatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Courier Partner
                </label>
                <select
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                >
                  <option value="Delhivery">Delhivery Express</option>
                  <option value="India Post">India Post Speed Post</option>
                  <option value="Shiprocket">Shiprocket</option>
                  <option value="Blue Dart">Blue Dart</option>
                  <option value="DTDC">DTDC</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  AWB Tracking Number
                </label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm font-mono"
                  placeholder="e.g. DLH-192837482"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setDispatchModalOpen(false)}
                  className="px-4 py-2 border border-craft-300 rounded-xl text-xs text-craft-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Mark as Shipped
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-craft-200 mb-4">
              <h3 className="font-bold text-base text-craft-900">
                Order #{selectedOrder.orderNumber || selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-full text-craft-400 hover:text-craft-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-craft-50 p-4 rounded-2xl">
                <p className="font-bold text-craft-900 mb-1">Customer Details</p>
                <p>{selectedOrder.customer.fullName}</p>
                <p>{selectedOrder.customer.email}</p>
                <p>{selectedOrder.customer.phone}</p>
                <p className="mt-2 text-craft-600">
                  {selectedOrder.customer.addressLine1}, {selectedOrder.customer.city},{' '}
                  {selectedOrder.customer.state} - {selectedOrder.customer.pincode}
                </p>
              </div>

              <div>
                <p className="font-bold text-craft-900 mb-2">Items Ordered</p>
                <div className="divide-y divide-craft-100 border border-craft-200 rounded-2xl overflow-hidden">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-craft-900">{item.name}</p>
                        <p className="text-[11px] text-craft-500">
                          Qty: {item.quantity} • ₹{item.price} each
                        </p>
                      </div>
                      <p className="font-bold text-craft-900">
                        ₹{item.price * item.quantity}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-craft-200 pt-3 flex justify-between font-bold text-sm text-craft-900">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
