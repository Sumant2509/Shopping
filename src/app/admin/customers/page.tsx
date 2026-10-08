'use client';

import React, { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Users, ShoppingBag, Mail, Phone, UserCheck, UserX, Calendar, Search } from 'lucide-react';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  addressCount: number;
  orderCount: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    const res = await fetch('/api/admin/customers');
    const data = await res.json();
    if (data.success) setCustomers(data.customers);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const toggleStatus = async (id: string, current: boolean) => {
    setTogglingId(id);
    await fetch('/api/admin/customers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: id, isActive: !current }),
    });
    await fetchCustomers();
    setTogglingId(null);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="flex min-h-screen bg-craft-950">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-400" /> Registered Customers
            </h1>
            <p className="text-craft-400 text-sm mt-1">{customers.length} customer{customers.length !== 1 ? 's' : ''} registered</p>
          </div>
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-craft-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email or phone…"
              className="w-full pl-9 pr-3 py-2.5 bg-craft-900 border border-craft-800 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 placeholder-craft-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-craft-900 rounded-2xl border border-craft-800 text-center py-16 px-8">
            <Users className="w-12 h-12 text-craft-700 mx-auto mb-3" />
            <p className="text-craft-400 font-medium">
              {search ? 'No customers match your search' : 'No customers registered yet'}
            </p>
            {!search && (
              <p className="text-craft-600 text-xs mt-2">Customer accounts will appear here after they sign up on the website.</p>
            )}
          </div>
        ) : (
          <div className="bg-craft-900 rounded-2xl border border-craft-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-craft-800">
                    <th className="text-left px-4 py-3 text-craft-400 font-semibold uppercase tracking-wider">Customer</th>
                    <th className="text-left px-4 py-3 text-craft-400 font-semibold uppercase tracking-wider hidden sm:table-cell">Contact</th>
                    <th className="text-center px-4 py-3 text-craft-400 font-semibold uppercase tracking-wider">Orders</th>
                    <th className="text-left px-4 py-3 text-craft-400 font-semibold uppercase tracking-wider hidden md:table-cell">Joined</th>
                    <th className="text-center px-4 py-3 text-craft-400 font-semibold uppercase tracking-wider">Status</th>
                    <th className="text-center px-4 py-3 text-craft-400 font-semibold uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-craft-800">
                  {filtered.map(customer => (
                    <tr key={customer.id} className="hover:bg-craft-800/40 transition-colors">
                      {/* Name + avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-terracotta-700 to-amber-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{customer.name}</p>
                            <p className="text-craft-500 text-[11px]">{customer.id}</p>
                          </div>
                        </div>
                      </td>
                      {/* Contact */}
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="space-y-1">
                          <p className="flex items-center gap-1.5 text-craft-300">
                            <Mail className="w-3 h-3 text-craft-500" />
                            {customer.email}
                          </p>
                          <p className="flex items-center gap-1.5 text-craft-400">
                            <Phone className="w-3 h-3 text-craft-500" />
                            {customer.phone}
                          </p>
                        </div>
                      </td>
                      {/* Orders */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 bg-craft-800 text-amber-400 font-bold px-2.5 py-1 rounded-lg">
                          <ShoppingBag className="w-3 h-3" />
                          {customer.orderCount}
                        </span>
                      </td>
                      {/* Joined */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="flex items-center gap-1 text-craft-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(customer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          customer.isActive ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'
                        }`}>
                          {customer.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {customer.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => toggleStatus(customer.id, customer.isActive)}
                          disabled={togglingId === customer.id}
                          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-50 ${
                            customer.isActive
                              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/60'
                              : 'bg-green-900/30 text-green-400 hover:bg-green-900/60'
                          }`}
                        >
                          {togglingId === customer.id ? '…' : customer.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
