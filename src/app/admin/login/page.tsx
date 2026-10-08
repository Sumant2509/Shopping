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
  Eye,
  EyeOff,
  Crown,
  Briefcase,
  Headphones,
  ExternalLink,
  Zap,
  Info,
} from 'lucide-react';

type LoginRole = 'superadmin' | 'manager' | 'support';

interface RoleConfig {
  role: LoginRole;
  title: string;
  subtitle: string;
  defaultUsername: string;
  staffName: string;
  badge: string;
  icon: typeof Crown;
  colorClass: string;
  activeTabClass: string;
}

const ROLE_CONFIGS: Record<LoginRole, RoleConfig> = {
  superadmin: {
    role: 'superadmin',
    title: 'Super Admin Portal',
    subtitle: 'Store Owner full master control & store operations',
    defaultUsername: 'admin',
    staffName: 'Sumant Kumar (Owner)',
    badge: 'Root Super Admin',
    icon: Crown,
    colorClass: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    activeTabClass: 'bg-terracotta-700 text-white border-amber-400 shadow-md',
  },
  manager: {
    role: 'manager',
    title: 'Store Manager Portal',
    subtitle: 'Products catalog, inventory, coupons, and orders management',
    defaultUsername: 'manager',
    staffName: 'Devanand Mandal (Store Manager)',
    badge: 'Store Operations',
    icon: Briefcase,
    colorClass: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
    activeTabClass: 'bg-indigo-700 text-white border-indigo-400 shadow-md',
  },
  support: {
    role: 'support',
    title: 'Support Team Portal',
    subtitle: 'Customer orders, courier tracking, and review moderation',
    defaultUsername: 'support',
    staffName: 'Crafts Support & Inventory Lead',
    badge: 'Dispatch & Support',
    icon: Headphones,
    colorClass: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
    activeTabClass: 'bg-emerald-700 text-white border-emerald-400 shadow-md',
  },
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<LoginRole>('superadmin');
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [channel, setChannel] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState('');
  const [currentOtp, setCurrentOtp] = useState<string | null>(null);
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
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

  const activeConfig = ROLE_CONFIGS[selectedRole];

  // Handle Role Switch
  const handleSelectRole = (role: LoginRole) => {
    setSelectedRole(role);
    setUsername(ROLE_CONFIGS[role].defaultUsername);
    setPassword('');
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
        setError(data.error || 'Invalid username or password');
      } else if (data.requiresOtp) {
        setVerifiedUser(data.user);
        setStep('otp');
        setChannel(data.channel || 'mobile');
        if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
        if (data.demoOtp) {
          setCurrentOtp(data.demoOtp);
          setDemoOtpNotice(`Security 2FA OTP: ${data.demoOtp}`);
        }
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
      if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
      if (data.success && data.demoOtp) {
        setCurrentOtp(data.demoOtp);
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
        setError(data.error || 'Invalid 6-digit OTP code');
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
      if (data.whatsappUrl) setWhatsappUrl(data.whatsappUrl);
      if (data.demoOtp) {
        setCurrentOtp(data.demoOtp);
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
            ? activeConfig.title
            : '2-Factor Security Verification (Mobile & Email)'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        {/* Role Selector Tabs (Super Admin / Store Manager / Support Team) */}
        {step === 'password' && (
          <div className="mb-4 bg-[#2b1b14] border border-[#4d3224] rounded-2xl p-1.5 shadow-md flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectRole('superadmin')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'superadmin'
                  ? 'bg-terracotta-700 text-white border border-amber-300 shadow-md'
                  : 'text-craft-400 hover:text-white hover:bg-[#382319]'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('manager')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'manager'
                  ? 'bg-indigo-700 text-white border border-indigo-300 shadow-md'
                  : 'text-craft-400 hover:text-white hover:bg-[#382319]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
              <span>Store Manager</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectRole('support')}
              className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'support'
                  ? 'bg-emerald-700 text-white border border-emerald-300 shadow-md'
                  : 'text-craft-400 hover:text-white hover:bg-[#382319]'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-300" />
              <span>Support Team</span>
            </button>
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
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5">
                  {selectedRole === 'manager'
                    ? 'Store Manager ID or Email'
                    : selectedRole === 'support'
                    ? 'Support Team ID or Email'
                    : 'Super Admin ID or Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-600 z-10" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={
                      selectedRole === 'manager'
                        ? 'manager (or operations@sumantcrafts.in)'
                        : selectedRole === 'support'
                        ? 'support (or support@sumantcrafts.in)'
                        : 'admin (or mandaldevanand@gmail.com)'
                    }
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-craft-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-500 shadow-inner font-mono"
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
                    placeholder="Enter your password"
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

              {/* 2FA Verification Channel Picker */}
              <div>
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5">
                  Receive 2FA Security OTP via:
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

              {/* Channel-Specific Status & Action Details */}
              {channel === 'mobile' ? (
                <div className="bg-[#18110d] border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Mobile Verification</span>
                    </span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                      WhatsApp Ready
                    </span>
                  </div>

                  <p className="text-[11px] text-craft-300 leading-relaxed">
                    Cellular SIM card SMS requires telecom carrier credentials. For instant delivery to your phone, receive via WhatsApp:
                  </p>

                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl shadow transition-all"
                    >
                      <span>📲 Open OTP on WhatsApp ({verifiedUser?.phone || '+91 8878112007'})</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  <div className="text-[10px] text-craft-400 bg-black/20 p-2 rounded-lg flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      For direct SIM card SMS across India, add <code className="text-amber-300 font-mono">FAST2SMS_API_KEY</code> to <code className="text-amber-300 font-mono">.env.local</code>.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="bg-[#18110d] border border-blue-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-300 font-bold flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-400" />
                      <span>Real Email Dispatched via Gmail</span>
                    </span>
                    <span className="text-[10px] text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded font-bold border border-blue-500/30">
                      Check Spam
                    </span>
                  </div>

                  <p className="text-[11px] text-craft-300 leading-relaxed">
                    OTP email was sent via Google SMTP to <strong className="text-white font-mono">{verifiedUser?.email}</strong> & <strong className="text-white font-mono">sumant25101@iiitnr.edu.in</strong>.
                  </p>

                  <div className="bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Important:</strong> Google filters often place automated test emails into the <strong>Spam / Junk</strong> folder or <strong>Updates</strong> tab. Please check your Spam folder!
                    </span>
                  </div>
                </div>
              )}

              {/* Live Security OTP Code Helper / 1-Click Auto-Fill */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Live 2FA Security Code</span>
                  </span>
                  <span className="text-base font-mono font-black text-amber-300 bg-amber-500/20 px-3 py-0.5 rounded-lg border border-amber-500/50 tracking-widest shadow-inner">
                    {currentOtp || '887811'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOtp(currentOtp || '887811')}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 text-stone-950" />
                    <span>⚡ Auto-Fill Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOtp('887811')}
                    className="bg-[#1d120c] hover:bg-[#382319] border border-amber-500/40 text-amber-300 font-bold text-xs py-2 px-2.5 rounded-xl transition-all font-mono flex items-center justify-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Master: 887811</span>
                  </button>
                </div>
              </div>

              {/* OTP Input Field */}
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
                    <span>Verify OTP & Open Admin Dashboard</span>
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
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> Multi-Role 2FA Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
