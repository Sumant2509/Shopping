'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, CheckCircle, Clock, X } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { adminApi } from '@/lib/admin-api';
import { Coupon } from '@/lib/types';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    code: '',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 499,
    maxDiscount: 150,
    expiresAt: '2026-12-31',
    description: '',
  });

  const loadCoupons = async () => {
    setLoading(true);
    const data = await adminApi.getCoupons();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const newCoupon: Coupon = {
      code: form.code.toUpperCase().trim(),
      discountPercent: form.discountType === 'percent' ? Number(form.discountValue) : undefined,
      discountFlat: form.discountType === 'flat' ? Number(form.discountValue) : undefined,
      minOrderAmount: Number(form.minOrderAmount),
      maxDiscount: Number(form.maxDiscount) || undefined,
      expiresAt: form.expiresAt,
      isActive: true,
      description: form.description || `${form.discountValue}${form.discountType === 'percent' ? '%' : '₹'} off discount code`,
    };

    await adminApi.saveCoupon(newCoupon);
    setModalOpen(false);
    await loadCoupons();
  };

  const toggleCoupon = async (coupon: Coupon) => {
    await adminApi.saveCoupon({ ...coupon, isActive: !coupon.isActive });
    await loadCoupons();
  };

  return (
    <AdminLayout title="Coupons & Promo Codes">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-craft-900">
            Promotional Coupons ({coupons.length})
          </h2>
          <p className="text-xs text-craft-500">
            Create discount coupon codes for festive sales and first-time buyers.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <div
            key={coupon.code}
            className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-bold text-sm bg-terracotta-50 text-terracotta-800 px-3 py-1 rounded-lg border border-terracotta-200">
                  {coupon.code}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    coupon.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-craft-200 text-craft-600'
                  }`}
                >
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs font-semibold text-craft-900 mb-1">
                {coupon.discountPercent
                  ? `${coupon.discountPercent}% Instant Off`
                  : `Flat ₹${coupon.discountFlat} Off`}
              </p>
              <p className="text-xs text-craft-500 leading-relaxed mb-3">
                {coupon.description}
              </p>
              <div className="text-[11px] text-craft-500 space-y-0.5 border-t border-craft-100 pt-3">
                <p>Min Order: ₹{coupon.minOrderAmount}</p>
                <p>Expires: {coupon.expiresAt}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-craft-100 flex items-center justify-end">
              <button
                onClick={() => toggleCoupon(coupon)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  coupon.isActive
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                {coupon.isActive ? 'Disable Code' : 'Enable Code'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-craft-200 mb-4">
              <h3 className="font-bold text-base text-craft-900">Create New Coupon</h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="w-5 h-5 text-craft-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DIWALI20"
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Discount Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="flat">Flat Rupee (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Min Order (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. 20% festive discount on all doormats"
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-craft-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-craft-300 rounded-xl text-xs text-craft-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
