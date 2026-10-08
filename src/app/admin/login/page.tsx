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
  Eye,
  EyeOff,
  Copy,
  Check,
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
  const [showPassword, setShowPassword] = useState(false);
  const [channel, setChannel] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
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
    <div className="min-h-screen bg-[#1d120c] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-craft-200">
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
        {/* Quick Demo Admin Selector with Clearly Visible ID & Pass */}
        {step === 'password' && (
          <div className="mb-4 bg-[#2b1b14] border border-[#4d3224] rounded-2xl p-3.5 shadow-md">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Select Admin User (Click to Auto-Fill):
              </p>
              <span className="text-[10px] text-craft-300 font-mono">3 Accounts Active</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {DEMO_ADMINS.map((adm) => {
                const Icon = adm.icon;
                const isSelected = username === adm.username;
                return (
                  <button
                    key={adm.username}
                    type="button"
                    onClick={() => handleSelectDemoAdmin(adm)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#3b251b] border-amber-400 text-white ring-2 ring-amber-400 shadow-md'
                        : 'bg-[#20140e] border-[#3f291e] text-craft-300 hover:border-amber-700/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="font-bold truncate text-[11px] text-white">
                        {adm.roleName}
                      </span>
                    </div>

                    <div className="space-y-0.5 pt-1 border-t border-[#4d3224] text-[10px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-craft-400">ID:</span>
                        <span className="text-amber-300 font-bold">@{adm.username}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-craft-400">Pass:</span>
                        <span className="text-emerald-300 font-bold">{adm.pass}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[#2b1b14] py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-[#4d3224]">
          {error && (
            <div className="mb-5 bg-red-950/80 border border-red-600 text-red-200 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {demoOtpNotice && (
            <div className="mb-5 bg-amber-950/80 border border-amber-500 text-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-mono font-bold tracking-widest">{demoOtpNotice}</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 font-mono font-bold">
                Master: 887811
              </span>
            </div>
          )}

          {step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Username Input with Crisp High-Contrast Style */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider">
                    Admin Username or Email
                  </label>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    Active ID: {username}
                  </span>
                </div>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-600 z-10" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username (admin / manager / support)"
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-craft-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input with Eye Show/Hide Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Hide Password</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show Password</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-600 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-craft-300 text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 p-1.5 rounded-lg transition-colors z-10"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-terracotta-700" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Clearly Visible Credentials Card with Copy Buttons */}
              <div className="p-3 bg-[#1d120c] rounded-2xl border border-[#4d3224] text-xs space-y-2 shadow-inner">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>Current Credentials ({showPassword ? 'Visible' : 'Hidden'}):</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-amber-400 hover:underline font-medium"
                  >
                    {showPassword ? 'Click to Mask' : 'Click to Reveal'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#281810] p-2 rounded-xl border border-[#42291d] flex items-center justify-between">
                    <div>
                      <span className="text-craft-400 block text-[9px] uppercase tracking-wider">Username ID</span>
                      <strong className="text-white text-xs">{username}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(username, 'id')}
                      className="text-craft-400 hover:text-amber-300 p-1"
                      title="Copy ID"
                    >
                      {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="bg-[#281810] p-2 rounded-xl border border-[#42291d] flex items-center justify-between">
                    <div>
                      <span className="text-craft-400 block text-[9px] uppercase tracking-wider">Password</span>
                      <strong className="text-emerald-300 text-xs">
                        {showPassword ? password : '••••••••'}
                      </strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(password, 'pass')}
                      className="text-craft-400 hover:text-amber-300 p-1"
                      title="Copy Password"
                    >
                      {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 2FA Verification Channel Picker */}
              <div>
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5">
                  Preferred 2FA Verification Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChannel('mobile')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      channel === 'mobile'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                        : 'bg-[#1d120c] border-[#4d3224] text-craft-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-400" />
                    <span>Mobile SMS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                      channel === 'email'
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400'
                        : 'bg-[#1d120c] border-[#4d3224] text-craft-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>Email OTP</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors mt-2"
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
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <span>🚀 Instant 1-Click Admin Access (Bypass OTP)</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              {/* Active Admin Profile Card */}
              {verifiedUser && (
                <div className="bg-[#1d120c] border border-[#4d3224] rounded-2xl p-3.5 flex items-center justify-between shadow-inner">
                  <div>
                    <p className="text-white text-xs font-bold">{verifiedUser.name}</p>
                    <p className="text-craft-400 text-[11px] font-mono">@{verifiedUser.username}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg border bg-amber-500/10 border-amber-500/30 text-amber-300">
                    {verifiedUser.role}
                  </span>
                </div>
              )}

              {/* 2FA Channel Switcher */}
              <div>
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5">
                  Select Verification Channel:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('mobile')}
                    className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-xs ${
                      channel === 'mobile'
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-[#1d120c] border-[#4d3224] text-craft-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Mobile SMS</span>
                    </span>
                    <span className="text-[10px] text-craft-300 truncate font-mono">
                      {verifiedUser?.maskedPhone || '+91 88*** ***07'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchChannel('email')}
                    className={`flex flex-col items-start p-2.5 rounded-xl border transition-all text-xs ${
                      channel === 'email'
                        ? 'bg-amber-500/20 border-amber-400 text-white ring-1 ring-amber-400'
                        : 'bg-[#1d120c] border-[#4d3224] text-craft-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold mb-0.5">
                      <Mail className="w-3.5 h-3.5 text-amber-400" />
                      <span>Email OTP</span>
                    </span>
                    <span className="text-[10px] text-craft-300 truncate font-mono">
                      {verifiedUser?.maskedEmail || 'ma***@gmail.com'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Security OTP
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 887811"
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full pl-11 pr-3.5 py-3.5 rounded-xl border-2 border-amber-500 text-xl font-bold font-mono tracking-widest text-center text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-inner"
                  />
                </div>
                <p className="text-[11px] text-craft-300 mt-2">
                  OTP was sent via {channel === 'mobile' ? 'Mobile SMS' : 'Email'} to{' '}
                  <span className="text-amber-300 font-mono font-bold">
                    {channel === 'mobile' ? verifiedUser?.maskedPhone : verifiedUser?.maskedEmail}
                  </span>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-colors mt-2"
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
                  className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-bold"
                >
                  <RefreshCw className="w-3 h-3" /> Resend OTP
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#4d3224] flex items-center justify-between text-xs">
            <Link
              href="/"
              className="text-craft-400 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <span className="text-[10px] text-craft-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Dual 2FA Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
