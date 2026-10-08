'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, ShoppingBag, IndianRupee } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { adminApi } from '@/lib/admin-api';
import { Customer } from '@/lib/types';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      const data = await adminApi.getCustomers();
      setCustomers(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <AdminLayout title="Registered Customers">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-craft-900">
            Customer Directory ({filtered.length})
          </h2>
          <p className="text-xs text-craft-500">
            View customer contact details, total orders placed, and lifetime spend.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-craft-200 mb-6 flex items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
          <input
            type="text"
            placeholder="Search by customer name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-craft-200 rounded-xl text-xs text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-craft-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-craft-50 text-craft-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Customer Name</th>
                <th className="px-6 py-3.5">Mobile & Email</th>
                <th className="px-6 py-3.5">Total Orders</th>
                <th className="px-6 py-3.5">Lifetime Spend</th>
                <th className="px-6 py-3.5">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-craft-100">
              {filtered.map((cust) => (
                <tr key={cust.id} className="hover:bg-craft-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-terracotta-100 text-terracotta-800 font-bold text-xs flex items-center justify-center">
                      {cust.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-craft-900 text-xs">{cust.name}</p>
                      <p className="text-[11px] text-craft-500 font-mono">{cust.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <p className="flex items-center gap-1.5 text-craft-800">
                      <Phone className="w-3.5 h-3.5 text-craft-400" />
                      <span>{cust.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-craft-500 text-[11px] mt-0.5">
                      <Mail className="w-3.5 h-3.5 text-craft-400" />
                      <span>{cust.email}</span>
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-craft-900">
                    {cust.totalOrders || 1} Orders
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-terracotta-700">
                    ₹{cust.totalSpent || 499}
                  </td>
                  <td className="px-6 py-4 text-xs text-craft-500">
                    {new Date(cust.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
