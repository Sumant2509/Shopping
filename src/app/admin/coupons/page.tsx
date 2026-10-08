'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Coupon } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // New Coupon Form
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(499);
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.toUpperCase().trim(),
          discountPercent: Number(discountPercent),
          minOrderValue: Number(minOrderValue),
          isActive: true,
          description: description || `Get ${discountPercent}% OFF on orders above ₹${minOrderValue}`,
        }),
      });

      const data = await res.json();
      if (data.coupon) {
        setCoupons(prev => [...prev, data.coupon]);
        setCode('');
        setDescription('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
            Discount Coupons & Promo Codes
          </h1>
          <p className="text-xs sm:text-sm text-craft-600 mt-1">
            Create promotional discount codes for festivals, new customers, and high-value orders.
          </p>
        </div>

        {/* Add Coupon Form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-sm mb-8">
          <h2 className="font-serif font-bold text-base text-craft-950 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-terracotta-700" />
            <span>Create New Promo Coupon</span>
          </h2>

          <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. DIWALI20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Discount (%) *</label>
              <input
                type="number"
                min={1}
                max={90}
                required
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Min Order Value (₹) *</label>
              <input
                type="number"
                min={0}
                required
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-colors"
              >
                Create Coupon
              </button>
            </div>
          </form>
        </div>

        {/* Existing Coupons Table */}
        <div className="bg-white rounded-3xl border border-craft-200 shadow-warm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-craft-50 border-b border-craft-200 text-craft-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Code</th>
                <th className="py-3.5 px-5">Discount</th>
                <th className="py-3.5 px-5">Min Order</th>
                <th className="py-3.5 px-5">Description</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-craft-100 text-craft-700 font-medium">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-craft-50/80">
                  <td className="py-4 px-5">
                    <span className="font-mono font-bold text-terracotta-800 text-sm bg-terracotta-50 px-2.5 py-1 rounded border border-terracotta-200">
                      {c.code}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-bold text-emerald-800 text-sm">
                    {c.discountPercent ? `${c.discountPercent}% OFF` : `₹${c.discountAmount} OFF`}
                  </td>

                  <td className="py-4 px-5">
                    {formatPrice(c.minOrderValue)}
                  </td>

                  <td className="py-4 px-5 text-craft-500">
                    {c.description}
                  </td>

                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
