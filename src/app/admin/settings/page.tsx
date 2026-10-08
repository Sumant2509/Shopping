'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Store, Phone, MapPin, Truck, Lock, UserCheck } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SiteSettings } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Admin Credential States
  const [adminUsername, setAdminUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [credMsg, setCredMsg] = useState('');
  const [credError, setCredError] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAdminCreds();
  }, []);

  const loadAdminCreds = async () => {
    try {
      const res = await fetch('/api/admin/credentials');
      const data = await res.json();
      if (data.username) setAdminUsername(data.username);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCredsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredMsg('');
    setCredError('');
    if (!newPassword) {
      setCredError('Please enter a new password');
      return;
    }
    setUpdatingCreds(true);
    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUsername: adminUsername,
          newPassword: newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCredMsg('Admin Username and Password updated successfully!');
        setNewPassword('');
      } else {
        setCredError(data.error || 'Failed to update credentials');
      }
    } catch (e) {
      setCredError('Failed to update credentials');
    } finally {
      setUpdatingCreds(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex bg-craft-100/50">
        <AdminSidebar />
        <main className="flex-1 p-10 text-craft-500">Loading store settings...</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
            Store & Business Configuration
          </h1>
          <p className="text-xs sm:text-sm text-craft-600 mt-1">
            Configure COD payment rules, free shipping thresholds, WhatsApp contact, and workshop details.
          </p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Store settings saved and updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Shipping & Payment Rules */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-terracotta-700" />
              <span>Shipping & Payment Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Free Shipping Minimum (₹)
                </label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Standard Flat Shipping Fee (₹)
                </label>
                <input
                  type="number"
                  value={settings.flatShippingRate}
                  onChange={(e) => setSettings({ ...settings, flatShippingRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Return Window (Days)
                </label>
                <input
                  type="number"
                  value={settings.returnWindowDays}
                  onChange={(e) => setSettings({ ...settings, returnWindowDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-craft-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableCOD}
                  onChange={(e) => setSettings({ ...settings, enableCOD: e.target.checked })}
                  className="rounded text-terracotta-700 focus:ring-terracotta-500"
                />
                <span>Enable Cash on Delivery (COD) for Indian PIN Codes</span>
              </label>
            </div>
          </div>

          {/* Contact & Workshop Info */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-terracotta-700" />
              <span>Contact & Workshop Address</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Owner / Maker Name</label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">WhatsApp & Support Phone</label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Support Email Address</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Workshop & Dispatch Address</label>
              <textarea
                rows={2}
                value={settings.workshopAddress}
                onChange={(e) => setSettings({ ...settings, workshopAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>
          </div>

          {/* Announcement Bar */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Header Announcement Bar
            </h2>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Top Banner Announcement Text</label>
              <input
                type="text"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-8 py-3 rounded-full text-xs shadow-warm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

        {/* Admin Credentials Change Box */}
        <div className="mt-10 bg-white p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-craft-200 gap-2">
            <h2 className="font-serif font-bold text-base text-craft-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Super Admin Credentials & Multi-User Access</span>
            </h2>
            <a
              href="/admin/team"
              className="text-xs font-bold text-terracotta-700 hover:text-terracotta-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
            >
              👥 Manage All 3 Admin Accounts & 2FA →
            </a>
          </div>

          {credMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{credMsg}</span>
            </div>
          )}

          {credError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              {credError}
            </div>
          )}

          <form onSubmit={handleCredsSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Admin Username / ID
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. sumant_admin"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  New Admin Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updatingCreds}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-warm flex items-center gap-2 transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>{updatingCreds ? 'Updating...' : 'Update Admin ID & Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
