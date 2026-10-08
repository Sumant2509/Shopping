'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Save,
  CheckCircle2,
  Store,
  Phone,
  MapPin,
  Truck,
  Lock,
  UserCheck,
  UserPlus,
  ShieldCheck,
  Eye,
  EyeOff,
  Crown,
  Briefcase,
  Headphones,
  Users,
  Smartphone,
  Mail,
  AlertCircle,
  QrCode,
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { SiteSettings, AdminRole, AdminUserPublic } from '@/lib/types';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Admin Credential States
  const [adminUsername, setAdminUsername] = useState('admin');
  const [newPassword, setNewPassword] = useState('');
  const [showSuperPassword, setShowSuperPassword] = useState(false);
  const [credMsg, setCredMsg] = useState('');
  const [credError, setCredError] = useState('');
  const [updatingCreds, setUpdatingCreds] = useState(false);

  // Admin Team list & Create Admin inside Settings
  const [adminsList, setAdminsList] = useState<AdminUserPublic[]>([]);
  const [createName, setCreateName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createRole, setCreateRole] = useState<AdminRole>('manager');
  const [createPhone, setCreatePhone] = useState('+91 ');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');

  const [currentUser, setCurrentUser] = useState<{ role: string; name: string } | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(d => {
        if (d.admin) {
          setCurrentUser(d.admin);
          if (d.admin.role !== 'superadmin') {
            setAccessDenied(true);
            setLoading(false);
            return;
          }
        }
        loadSettings();
        loadAdminCreds();
        loadAdminsList();
      })
      .catch(() => {
        loadSettings();
        loadAdminCreds();
        loadAdminsList();
      });
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

  const loadAdminsList = async () => {
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (data.admins) setAdminsList(data.admins);
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
        setCredMsg('Super Admin Username/ID and Password updated successfully!');
        setNewPassword('');
        loadAdminsList();
      } else {
        setCredError(data.error || 'Failed to update credentials');
      }
    } catch (e) {
      setCredError('Failed to update credentials');
    } finally {
      setUpdatingCreds(false);
    }
  };

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess('');
    setCreateError('');

    if (!createName || !createUsername || !createEmail || !createPassword) {
      setCreateError('Name, Username ID, Email, and Password are required');
      return;
    }

    setCreatingAdmin(true);
    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName,
          username: createUsername,
          role: createRole,
          phone: createPhone,
          email: createEmail,
          password: createPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCreateSuccess(`Admin account '${data.admin.name}' (@${data.admin.username}) created successfully!`);
        setCreateName('');
        setCreateUsername('');
        setCreateEmail('');
        setCreatePhone('+91 ');
        setCreatePassword('');
        loadAdminsList();
      } else {
        setCreateError(data.error || 'Failed to create admin user');
      }
    } catch (e) {
      setCreateError('Error creating admin user');
    } finally {
      setCreatingAdmin(false);
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

  if (accessDenied) {
    return (
      <div className="min-h-screen flex bg-craft-100/50">
        <AdminSidebar />
        <main className="flex-1 p-6 sm:p-10 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-craft-200 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-craft-950">Super Admin Access Only</h2>
            <p className="text-xs text-craft-600 leading-relaxed">
              Store Settings, credentials, and 2FA configurations are strictly restricted to the primary <strong>Super Admin</strong> account. Store Managers and Support Team members do not have permission to view or edit this panel.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold text-xs transition-colors shadow-warm"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

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

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
            Store Settings & Operations
          </h1>
          <p className="text-xs sm:text-sm text-craft-600 mt-1">
            Manage your store details, artisan workshop address, shipping rates, and administrator accounts.
          </p>
        </div>

        {saved && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Store settings successfully updated and live!</span>
          </div>
        )}

        {/* Store Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <Store className="w-4 h-4 text-terracotta-700" />
              <span>General Store Brand Info</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Store Name</label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Master Artisan / Owner Name</label>
                <input
                  type="text"
                  value={settings.ownerName}
                  onChange={(e) => setSettings({ ...settings, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-craft-700 mb-1">Store Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <Phone className="w-4 h-4 text-terracotta-700" />
              <span>Contact & Support Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">WhatsApp Orders Number</label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={settings.supportPhone}
                  onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
              </div>
            </div>
          </div>

          {/* Workshop Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-terracotta-700" />
              <span>Workshop & Dispatch Location</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Full Workshop Address</label>
              <textarea
                rows={2}
                value={settings.workshopAddress}
                onChange={(e) => setSettings({ ...settings, workshopAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
              />
            </div>
          </div>

          {/* Shipping & COD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <Truck className="w-4 h-4 text-terracotta-700" />
              <span>Shipping & COD Rules</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Free Shipping Above (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Standard Flat Shipping (₹)</label>
                <input
                  type="number"
                  value={settings.flatShippingRate}
                  onChange={(e) => setSettings({ ...settings, flatShippingRate: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">COD Handling Fee (₹)</label>
                <input
                  type="number"
                  value={settings.codFee}
                  onChange={(e) => setSettings({ ...settings, codFee: Number(e.target.value) })}
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
                  className="w-4 h-4 rounded text-terracotta-700 focus:ring-terracotta-600"
                />
                <span>Enable Cash on Delivery (COD) Option</span>
              </label>
            </div>
          </div>

          {/* Online Payment & UPI Gateway Settings */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-terracotta-700" />
              <span>Online Payment & UPI Gateway Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Primary Store UPI ID (for QR Code & Mobile UPI Apps)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8878112007@upi"
                  value={settings.upiId || '8878112007@upi'}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-mono focus:outline-none focus:border-terracotta-600"
                />
                <p className="text-[10px] text-craft-500 mt-1">
                  Customer scan-to-pay dynamic QR codes and intent links pay directly to this UPI address.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">
                  Merchant Display Name (in Google Pay / PhonePe)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Home-Warrior"
                  value={settings.upiMerchantName || 'Home-Warrior'}
                  onChange={(e) => setSettings({ ...settings, upiMerchantName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600"
                />
                <p className="text-[10px] text-craft-500 mt-1">
                  Business name shown on customer phone when scanning UPI QR code.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-craft-100">
              <label className="flex items-center gap-2 text-xs font-bold text-craft-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enableUpiPayment !== false}
                  onChange={(e) => setSettings({ ...settings, enableUpiPayment: e.target.checked })}
                  className="w-4 h-4 rounded text-terracotta-700 focus:ring-terracotta-600"
                />
                <span>Enable Instant UPI QR & Mobile App Online Checkout</span>
              </label>
            </div>
          </div>

          {/* Announcement Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Announcement Bar
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
              <span>{saving ? 'Saving...' : 'Save Store Settings'}</span>
            </button>
          </div>
        </form>

        {/* ─── DEDICATED ADMIN ACCOUNTS & STORE MANAGERS SECTION ─── */}
        <div className="mt-12 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-craft-200">
            <div>
              <h2 className="font-serif font-bold text-xl text-craft-950 flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-terracotta-700" />
                <span>Admin Accounts & Store Managers</span>
              </h2>
              <p className="text-xs text-craft-600 mt-0.5">
                Create new admin IDs and passwords, manage store roles, and configure 2FA verification.
              </p>
            </div>

            <Link
              href="/admin/team"
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-amber-500/10 text-amber-900 border border-amber-300 px-3.5 py-2 rounded-xl hover:bg-amber-500/20 transition-colors self-start sm:self-auto"
            >
              <Users className="w-4 h-4 text-amber-700" />
              <span>Open Full Admin Team Directory →</span>
            </Link>
          </div>

          {/* Active Store Admins List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-craft-100">
              <h3 className="font-serif font-bold text-sm text-craft-950">
                Active Store Administrators ({adminsList.length})
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                2FA Security Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {adminsList.map((adm) => (
                <div
                  key={adm.id}
                  className="p-3.5 rounded-2xl border border-craft-200 bg-craft-50/50 flex flex-col justify-between text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-craft-950 truncate">{adm.name}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                      {adm.role}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] font-mono text-craft-600">
                    <div>
                      <span className="text-craft-400">ID: </span>
                      <strong className="text-craft-900 font-bold">@{adm.username}</strong>
                    </div>
                    <div className="truncate">
                      <span className="text-craft-400">Phone: </span>
                      <span>{adm.phone}</span>
                    </div>
                    <div className="truncate">
                      <span className="text-craft-400">Email: </span>
                      <span>{adm.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create New Admin ID & Password Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm space-y-5">
            <div className="pb-3 border-b border-craft-200">
              <h3 className="font-serif font-bold text-base text-craft-950 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-terracotta-700" />
                <span>Create New Store Admin (ID & Password)</span>
              </h3>
              <p className="text-xs text-craft-600 mt-1">
                Create a new administrator account with login ID, password, and mobile/email for 2FA OTP verification.
              </p>
            </div>

            {createSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            {createError && (
              <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 rounded-xl text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Admin Username / ID *</label>
                  <input
                    type="text"
                    required
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    placeholder="e.g. ramesh_manager"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Store Role *</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as AdminRole)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-medium"
                  >
                    <option value="superadmin">👑 Super Admin</option>
                    <option value="manager">📦 Store Manager</option>
                    <option value="support">🎧 Support & Dispatch</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Mobile Phone (for SMS 2FA) *</label>
                  <input
                    type="text"
                    required
                    value={createPhone}
                    onChange={(e) => setCreatePhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Email (for Email 2FA) *</label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="ramesh@sumantcrafts.in"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-craft-700">Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                    >
                      {showCreatePassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showCreatePassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? 'text' : 'password'}
                      required
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pr-9 px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{creatingAdmin ? 'Creating...' : 'Create Admin ID & Password'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Update Super Admin ID & Password Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Change Super Admin ID & Password</span>
            </h3>

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
                    Super Admin Username / ID
                  </label>
                  <input
                    type="text"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="e.g. admin"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-mono font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-craft-700">New Password</label>
                    <button
                      type="button"
                      onClick={() => setShowSuperPassword(!showSuperPassword)}
                      className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1"
                    >
                      {showSuperPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSuperPassword ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showSuperPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new strong password"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:border-terracotta-600 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updatingCreds}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2 transition-all"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{updatingCreds ? 'Updating...' : 'Update ID & Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
