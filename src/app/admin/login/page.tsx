'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  Store,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  Smartphone,
  Mail,
  Crown,
  Briefcase,
  Headphones,
} from 'lucide-react';

interface AdminAccountOption {
  roleName: string;
  username: string;
  pass: string;
  email: string;
  phone: string;
  icon: typeof Crown;
  badgeColor: string;
}

const DEMO_ADMINS: AdminAccountOption[] = [
  {
    roleName: 'Super Admin',
    username: 'admin',
    pass: 'admin12345',
    email: 'mandaldevanand@gmail.com',
    phone: '+91 8878112007',
    icon: Crown,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  {
    roleName: 'Store Manager',
    username: 'manager',
    pass: 'manager12345',
    email: 'operations@sumantcrafts.in',
    phone: '+91 9876543210',
    icon: Briefcase,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  {
    roleName: 'Support & Dispatch',
    username: 'support',
    pass: 'support12345',
    email: 'support@sumantcrafts.in',
    phone: '+91 9826012345',
    icon: Headphones,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin12345');
  const [channel, setChannel] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedUser, setVerifiedUser] = useState<{
    id: string;
    name: string;
    username: string;
    role: string;
    maskedPhone: string;
    maskedEmail: string;
    phone: string;
    email: string;
  } | null>(null);

  // Quick preset loader
  const handleSelectDemoAdmin = (admin: AdminAccountOption) => {
    setUsername(admin.username);
    setPassword(admin.pass);
    setError(null);
  };

  // Handle Step 1: Verify Password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          channel,
          step: 'password',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials');
      } else if (data.requiresOtp) {
        setVerifiedUser(data.user);
        setStep('otp');
        setChannel(data.channel || 'mobile');
        setDemoOtpNotice(data.demoOtp ? `Demo 2FA OTP: ${data.demoOtp}` : null);
      }
    } catch {
      setError('Login request failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Switch 2FA channel (Mobile SMS / Email)
  const handleSwitchChannel = async (newChannel: 'mobile' | 'email') => {
    if (loading || newChannel === channel) return;
    setChannel(newChannel);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          channel: newChannel,
          step: 'switch_channel',
        }),
      });

      const data = await res.json();
      if (data.success && data.demoOtp) {
        setDemoOtpNotice(`New 2FA OTP (${newChannel.toUpperCase()}): ${data.demoOtp}`);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError('Failed to switch verification channel.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Step 2: OTP submit
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          otp,
          channel,
          step: 'otp',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid 6-digit OTP');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          channel,
          step: 'resend_otp',
        }),
      });
      const data = await res.json();
      if (data.demoOtp) {
        setDemoOtpNotice(`New 2FA OTP (${channel.toUpperCase()}): ${data.demoOtp}`);
      }
    } catch {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-craft-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-craft-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-terracotta-700 text-white font-serif font-bold text-2xl flex items-center justify-center mx-auto border-2 border-amber-300 shadow-lg mb-4">
          SK
        </div>
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white tracking-tight">
          Sumant Crafts Admin
        </h2>
        <p className="mt-1 text-xs text-amber-300 font-medium uppercase tracking-wider">
          {step === 'password'
            ? 'Multi-Admin Portal Access'
            : '2-Factor Security Verification (Mobile & Email)'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Quick Demo Admin Selector */}
        {step === 'password' && (
          <div className="mb-4 bg-craft-900/90 border border-craft-800 rounded-2xl p-3.5">
            <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
              Select Admin User Account:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ADMINS.map((adm) => {
                const Icon = adm.icon;
                const isSelected = username === adm.username;
                return (
                  <button
                    key={adm.username}
                    type="button"
                    onClick={() => handleSelectDemoAdmin(adm)}
                    className={`p-2 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-craft-800 border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-craft-950/60 border-craft-800 text-craft-400 hover:border-craft-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold truncate text-[11px]">{adm.roleName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-craft-300 truncate">
                      @{adm.username}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-craft-900 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-craft-800">
          {error && (
            <div className="mb-5 bg-red-900/40 border border-red-700/60 text-red-200 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {demoOtpNotice && (
            <div className="mb-5 bg-amber-900/40 border border-amber-500/60 text-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono font-bold tracking-widest">{demoOtpNotice}</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">
                Master: 887811
              </span>
            </div>
          )}

          {step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin, manager, support"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-craft-950 border border-craft-700 rounded-xl text-xs text-white focus:outline-none focus:border-terracotta-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-craft-950 border border-craft-700 rounded-xl text-xs text-white focus:outline-none focus:border-terracotta-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Preferred 2FA Verification Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('mobile')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      channel === 'mobile'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-craft-950 border-craft-800 text-craft-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile SMS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                      channel === 'email'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-craft-950 border-craft-800 text-craft-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email OTP</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {loading ? (
                  <span>Checking Credentials...</span>
                ) : (
                  <>
                    <span>Verify Credentials & Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    const res = await fetch('/api/admin/login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ username, password, step: 'direct' }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      router.push('/admin/dashboard');
                      router.refresh();
                    } else {
                      setError(data.error || 'Login failed');
                    }
                  } catch {
                    setError('Login request failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>🚀 Instant 1-Click Admin Access</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {/* Active Admin Profile Card */}
              {verifiedUser && (
                <div className="bg-craft-950/90 border border-craft-800 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-white text-xs font-bold">{verifiedUser.name}</p>
                    <p className="text-craft-400 text-[11px] font-mono">@{verifiedUser.username}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-300">
                    {verifiedUser.role}
                  </span>
                </div>
              )}

              {/* 2FA Channel Switcher */}
              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Select Verification Channel:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('mobile')}
                    className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-xs ${
                      channel === 'mobile'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-craft-950 border-craft-800 text-craft-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mobile SMS</span>
                    </span>
                    <span className="text-[10px] text-craft-300 truncate">
                      {verifiedUser?.maskedPhone || '+91 88*** ***07'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('email')}
                    className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-xs ${
                      channel === 'email'
                        ? 'bg-amber-500/20 border-amber-400 text-white'
                        : 'bg-craft-950 border-craft-800 text-craft-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email OTP</span>
                    </span>
                    <span className="text-[10px] text-craft-300 truncate">
                      {verifiedUser?.maskedEmail || 'ma***@gmail.com'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Security OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 887811"
                    className="w-full pl-10 pr-3.5 py-3 bg-craft-950 border border-amber-500/50 rounded-xl text-lg text-white font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
                <p className="text-[11px] text-craft-400 mt-2">
                  OTP was sent via {channel === 'mobile' ? 'Mobile SMS' : 'Email'} to{' '}
                  <span className="text-amber-300 font-mono">
                    {channel === 'mobile' ? verifiedUser?.maskedPhone : verifiedUser?.maskedEmail}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors mt-2"
              >
                {loading ? (
                  <span>Authenticating OTP...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify OTP & Open Dashboard</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="text-xs text-craft-400 hover:text-white"
                >
                  ← Back to Password
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-craft-800 flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-craft-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <span className="text-[10px] text-craft-500 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dual 2FA Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
