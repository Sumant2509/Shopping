'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ShieldCheck, Globe, Truck } from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { adminApi } from '@/lib/admin-api';
import { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SiteSettings>({
    storeName: 'Sumant Crafts',
    phone: '+91 8878112007',
    email: 'mandaldevanand@gmail.com',
    whatsappNumber: '+91 8878112007',
    address: 'Home Warrior Handmade Doormats, Khursipar, Bhilai, Durg, Chhattisgarh - 490011, India',
    freeShippingThreshold: 699,
    defaultShippingFee: 49,
    codEnabled: true,
    announcementText: 'Direct from Maker (Sumant Kumar) • 100% Handmade in India • Free Shipping on ₹699+',
  });

  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000'
  );

  useEffect(() => {
    async function load() {
      const data = await adminApi.getSettings();
      setForm(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi.saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout title="Store & API Configuration">
      <div className="max-w-3xl">
        {saved && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Backend API Connection */}
          <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-terracotta-600" />
              <h3 className="font-bold text-sm text-craft-900">
                Storefront Backend API Link
              </h3>
            </div>
            <p className="text-xs text-craft-500 mb-4">
              Configure the production URL of your customer-facing storefront to sync live orders and products.
            </p>
            <div>
              <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                Storefront API Base URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs font-mono"
                placeholder="https://yourstore.vercel.app or http://localhost:3000"
              />
              <p className="text-[11px] text-craft-400 mt-1">
                Local dev: <code className="bg-craft-100 px-1 py-0.5 rounded">http://localhost:3000</code> • Production: Your live custom domain
              </p>
            </div>
          </div>

          {/* Store Details */}
          <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-craft-900">
              Artisan Workshop Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Support Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                Workshop Physical Address
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Shipping & COD Policy */}
          <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-terracotta-600" />
              <h3 className="font-bold text-sm text-craft-900">
                Shipping & Payment Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Free Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={form.freeShippingThreshold}
                  onChange={(e) =>
                    setForm({ ...form, freeShippingThreshold: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Default Delivery Fee (₹)
                </label>
                <input
                  type="number"
                  value={form.defaultShippingFee}
                  onChange={(e) =>
                    setForm({ ...form, defaultShippingFee: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="codEnabled"
                checked={form.codEnabled}
                onChange={(e) => setForm({ ...form, codEnabled: e.target.checked })}
                className="w-4 h-4 text-terracotta-600 rounded"
              />
              <label htmlFor="codEnabled" className="text-xs font-semibold text-craft-800">
                Enable Cash on Delivery (COD) for Indian postal zones
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-700 text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
