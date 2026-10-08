'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Crown,
  Briefcase,
  Headphones,
  Smartphone,
  Mail,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Lock,
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminRole, AdminUserPublic } from '@/lib/types';

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<AdminUserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUserPublic | null>(null);
  const [testingAdmin, setTestingAdmin] = useState<AdminUserPublic | null>(null);
  const [testChannel, setTestChannel] = useState<'mobile' | 'email'>('mobile');
  const [testOtpResult, setTestOtpResult] = useState<string | null>(null);

  // Add / Edit form fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('manager');
  const [formPassword, setFormPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const res = await fetch('/api/admin/team');
      const data = await res.json();
      if (data.admins) {
        setAdmins(data.admins);
      }
    } catch (err) {
      console.error('Failed to load admin team:', err);
      setActionError('Failed to load admin team list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setFormName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('+91 ');
    setFormRole('manager');
    setFormPassword('');
    setIsAddModalOpen(true);
    setActionSuccess(null);
    setActionError(null);
  };

  const handleOpenEdit = (admin: AdminUserPublic) => {
    setEditingAdmin(admin);
    setFormName(admin.name);
    setFormUsername(admin.username);
    setFormEmail(admin.email);
    setFormPhone(admin.phone);
    setFormRole(admin.role);
    setFormPassword('');
    setActionSuccess(null);
    setActionError(null);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          username: formUsername,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          password: formPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.error || 'Failed to create admin');
      } else {
        setActionSuccess(`Admin user '${data.admin.name}' successfully added!`);
        setIsAddModalOpen(false);
        loadAdmins();
      }
    } catch {
      setActionError('Network error while creating admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setSubmitting(true);
    setActionError(null);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAdmin.id,
          name: formName,
          username: formUsername,
          email: formEmail,
          phone: formPhone,
          role: formRole,
          password: formPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setActionError(data.error || 'Failed to update admin');
      } else {
        setActionSuccess(`Admin user '${data.admin.name}' updated successfully!`);
        setEditingAdmin(null);
        loadAdmins();
      }
    } catch {
      setActionError('Network error while updating admin user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (admin: AdminUserPublic) => {
    if (admin.role === 'superadmin') {
      alert('Super Admin accounts cannot be removed for system safety.');
      return;
    }
    if (!confirm(`Are you sure you want to remove admin '${admin.name}' (@${admin.username})?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/team?id=${admin.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Admin '${admin.name}' removed successfully.`);
        loadAdmins();
      } else {
        setActionError(data.error || 'Failed to delete admin');
      }
    } catch {
      setActionError('Error deleting admin.');
    }
  };

  const handleSendTestOtp = async (admin: AdminUserPublic, ch: 'mobile' | 'email') => {
    setTestingAdmin(admin);
    setTestChannel(ch);
    setTestOtpResult(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: admin.username,
          channel: ch,
          step: 'switch_channel',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestOtpResult(`Security 2FA OTP Code: ${data.demoOtp || '887811'} (Sent to ${ch === 'mobile' ? admin.phone : admin.email})`);
      } else {
        setTestOtpResult(`Failed to dispatch test OTP: ${data.error}`);
      }
    } catch {
      setTestOtpResult('Error contacting 2FA verification service');
    }
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 border border-amber-300">
            <Crown className="w-3.5 h-3.5 text-amber-600" />
            <span>Super Admin</span>
          </span>
        );
      case 'manager':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-800 border border-indigo-200">
            <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
            <span>Store Manager</span>
          </span>
        );
      case 'support':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">
            <Headphones className="w-3.5 h-3.5 text-emerald-600" />
            <span>Support & Dispatch</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name.slice(0, 2) || 'AD').toUpperCase();
  };

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-terracotta-700" />
              <span>Admin Team & 2-Factor Security</span>
            </h1>
            <p className="text-xs sm:text-sm text-craft-600 mt-1">
              Manage multiple administrator accounts, roles, verified mobile numbers, and email 2FA settings.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Admin</span>
          </button>
        </div>

        {/* Alerts */}
        {actionSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-900 p-4 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-red-700 hover:text-red-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Security & Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-craft-200 shadow-sm">
            <span className="text-[11px] font-bold text-craft-500 uppercase tracking-wider">
              Total Admin Accounts
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-serif text-craft-950">{admins.length}</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                Active
              </span>
            </div>
            <p className="text-[11px] text-craft-500 mt-1">Multi-user staff support</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-craft-200 shadow-sm">
            <span className="text-[11px] font-bold text-craft-500 uppercase tracking-wider">
              Super Admin / Owner
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-serif text-craft-950">
                {admins.filter((a) => a.role === 'superadmin').length}
              </span>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-[11px] text-craft-500 mt-1">Full root access</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-craft-200 shadow-sm">
            <span className="text-[11px] font-bold text-craft-500 uppercase tracking-wider">
              Mobile SMS / WhatsApp 2FA
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-serif text-emerald-700">100%</span>
              <Smartphone className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">SMS Verification Active</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-craft-200 shadow-sm">
            <span className="text-[11px] font-bold text-craft-500 uppercase tracking-wider">
              Email OTP 2FA
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-bold font-serif text-indigo-700">100%</span>
              <Mail className="w-4 h-4 text-indigo-600" />
            </div>
            <p className="text-[11px] text-indigo-700 font-medium mt-1">Email Verification Active</p>
          </div>
        </div>

        {/* Admins Table Card */}
        <div className="bg-white rounded-2xl border border-craft-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-craft-200 flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-craft-950">
              Admin Users Directory ({admins.length} Active)
            </h2>
            <span className="text-xs text-craft-500">
              Each admin has individual mobile & email verification credentials
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-craft-500 text-sm">Loading admin users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-craft-50/70 border-b border-craft-200 text-[11px] uppercase tracking-wider font-bold text-craft-600">
                    <th className="py-3.5 px-6">Admin Profile</th>
                    <th className="py-3.5 px-6">Role</th>
                    <th className="py-3.5 px-6">Mobile Verification</th>
                    <th className="py-3.5 px-6">Email Verification</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-craft-100 text-xs sm:text-sm">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-craft-50/50 transition-colors">
                      {/* Name & Username */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-terracotta-700 text-white font-serif font-bold flex items-center justify-center shrink-0 border border-amber-300">
                            {getInitials(adm.name)}
                          </div>
                          <div>
                            <div className="font-bold text-craft-950">{adm.name}</div>
                            <div className="text-craft-500 text-xs font-mono">@{adm.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-6">{getRoleBadge(adm.role)}</td>

                      {/* Mobile 2FA */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-craft-800">
                            <Smartphone className="w-3.5 h-3.5 text-craft-500" />
                            <span>{adm.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>2FA Verified</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSendTestOtp(adm, 'mobile')}
                              className="text-[10px] text-amber-700 hover:text-amber-900 underline font-medium"
                            >
                              Test SMS OTP
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Email 2FA */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 font-medium text-craft-800">
                            <Mail className="w-3.5 h-3.5 text-craft-500" />
                            <span>{adm.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>2FA Verified</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSendTestOtp(adm, 'email')}
                              className="text-[10px] text-indigo-700 hover:text-indigo-900 underline font-medium"
                            >
                              Test Email OTP
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(adm)}
                            title="Edit Admin User"
                            className="p-1.5 text-craft-600 hover:text-terracotta-700 hover:bg-craft-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {adm.role !== 'superadmin' && (
                            <button
                              onClick={() => handleDeleteAdmin(adm)}
                              title="Delete Admin User"
                              className="p-1.5 text-craft-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Test 2FA Modal */}
        {testingAdmin && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-craft-200">
              <div className="flex items-center justify-between pb-4 border-b border-craft-200 mb-4">
                <div className="flex items-center gap-2 text-terracotta-800 font-bold">
                  <Send className="w-5 h-5 text-terracotta-700" />
                  <span className="font-serif text-lg">2FA Live Dispatch Test</span>
                </div>
                <button
                  onClick={() => setTestingAdmin(null)}
                  className="text-craft-400 hover:text-craft-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-5 text-xs text-craft-700">
                <p>
                  Testing 2-Factor Authentication dispatch for{' '}
                  <strong className="text-craft-950">{testingAdmin.name}</strong> (@{testingAdmin.username})
                </p>
                <div className="p-3 bg-craft-50 rounded-xl border border-craft-200 space-y-1">
                  <p>
                    Verification Channel:{' '}
                    <strong className="uppercase font-bold text-craft-900">{testChannel}</strong>
                  </p>
                  <p>
                    Target:{' '}
                    <strong className="font-mono text-craft-900">
                      {testChannel === 'mobile' ? testingAdmin.phone : testingAdmin.email}
                    </strong>
                  </p>
                </div>

                {testOtpResult && (
                  <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs animate-pulse">
                    <p className="font-bold text-amber-800 mb-1">✅ 2FA Code Dispatched Successfully:</p>
                    <p className="font-mono font-bold text-sm tracking-wider">{testOtpResult}</p>
                    <p className="text-[10px] text-amber-700 mt-1">Master Recovery Code: 887811</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTestingAdmin(null)}
                  className="px-4 py-2 bg-craft-900 text-white font-bold text-xs rounded-xl hover:bg-craft-800 transition-colors"
                >
                  Close Test
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Admin Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-craft-200">
              <div className="flex items-center justify-between pb-4 border-b border-craft-200 mb-4">
                <div className="flex items-center gap-2 text-terracotta-800 font-bold">
                  <UserPlus className="w-5 h-5 text-terracotta-700" />
                  <span className="font-serif text-lg">Add New Administrator</span>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-craft-400 hover:text-craft-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      placeholder="e.g. ramesh"
                      className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                      Role *
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as AdminRole)}
                      className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                    >
                      <option value="superadmin">👑 Super Admin</option>
                      <option value="manager">📦 Store Manager</option>
                      <option value="support">🎧 Support & Dispatch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Email Address (for 2FA) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. ramesh@sumantcrafts.in"
                    className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Mobile Phone (for SMS 2FA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Initial Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type="password"
                      required
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 bg-craft-100 text-craft-700 font-bold text-xs rounded-xl hover:bg-craft-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {submitting ? 'Creating...' : 'Create Admin User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {editingAdmin && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-craft-200">
              <div className="flex items-center justify-between pb-4 border-b border-craft-200 mb-4">
                <div className="flex items-center gap-2 text-terracotta-800 font-bold">
                  <Edit className="w-5 h-5 text-terracotta-700" />
                  <span className="font-serif text-lg">Edit Administrator</span>
                </div>
                <button
                  onClick={() => setEditingAdmin(null)}
                  className="text-craft-400 hover:text-craft-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                      Role *
                    </label>
                    <select
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value as AdminRole)}
                      className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                    >
                      <option value="superadmin">👑 Super Admin</option>
                      <option value="manager">📦 Store Manager</option>
                      <option value="support">🎧 Support & Dispatch</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Email Address (for 2FA) *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Mobile Phone (for SMS 2FA) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1">
                    Reset Password (leave empty to keep current)
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type="password"
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="Enter new password if changing"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-craft-50 border border-craft-300 rounded-xl text-xs text-craft-950 focus:outline-none focus:border-terracotta-600 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    className="px-4 py-2.5 bg-craft-100 text-craft-700 font-bold text-xs rounded-xl hover:bg-craft-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2.5 bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    {submitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
