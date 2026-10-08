'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, LogOut, ShoppingBag, MapPin, Edit3, Save, X, ChevronRight, Home, Star } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { customer, logout, refreshCustomer } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-craft-50">
        <div className="w-8 h-8 border-4 border-terracotta-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        await refreshCustomer();
        setEditing(false);
        setSaveMsg('Profile updated successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch {
      setSaveMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  const memberSince = customer.createdAt
    ? new Date(customer.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-craft-50">
      {/* Top Nav */}
      <nav className="bg-white border-b border-craft-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-craft-800 font-serif font-bold text-lg">
            <Home className="w-5 h-5 text-terracotta-600" />
            Home-Warrior
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/account/orders" className="text-sm text-craft-600 hover:text-terracotta-700 font-medium flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" /> My Orders
            </Link>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-terracotta-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-bold font-serif shrink-0">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif font-bold text-2xl">{customer.name}</h1>
              <p className="text-white/80 text-sm">{customer.email}</p>
              {memberSince && (
                <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                  <Star className="w-3 h-3" /> Member since {memberSince}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {saveMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
            {saveMsg}
          </div>
        )}

        {/* Personal Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-craft-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-craft-100">
            <h2 className="font-semibold text-craft-900 flex items-center gap-2">
              <User className="w-4 h-4 text-terracotta-500" /> Personal Information
            </h2>
            {!editing ? (
              <button
                id="edit-profile-btn"
                onClick={() => { setEditing(true); setName(customer.name); setPhone(customer.phone); }}
                className="flex items-center gap-1.5 text-sm text-terracotta-600 hover:text-terracotta-800 font-medium"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-sm text-craft-400 hover:text-craft-600 font-medium">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="p-6 space-y-4">
            {/* Name */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-craft-400 uppercase tracking-wider font-semibold mb-1">Full Name</p>
                {editing ? (
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-craft-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                ) : (
                  <p className="text-craft-800 font-medium text-sm">{customer.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-craft-400 uppercase tracking-wider font-semibold mb-1">Email</p>
                <p className="text-craft-800 font-medium text-sm">{customer.email}</p>
                <p className="text-xs text-craft-400 mt-0.5">Email cannot be changed</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-craft-400 uppercase tracking-wider font-semibold mb-1">Mobile</p>
                {editing ? (
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-craft-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                ) : (
                  <p className="text-craft-800 font-medium text-sm">{customer.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl shadow-sm border border-craft-100 overflow-hidden divide-y divide-craft-50">
          <Link href="/account/orders" className="flex items-center justify-between px-6 py-4 hover:bg-craft-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-terracotta-50 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-terracotta-600" />
              </div>
              <div>
                <p className="font-medium text-craft-900 text-sm">My Orders</p>
                <p className="text-xs text-craft-400">View and track your orders</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-craft-300 group-hover:text-terracotta-500 transition-colors" />
          </Link>

          <Link href="/shop" className="flex items-center justify-between px-6 py-4 hover:bg-craft-50 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-craft-900 text-sm">Shop Doormats</p>
                <p className="text-xs text-craft-400">Explore our handmade collection</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-craft-300 group-hover:text-amber-500 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
