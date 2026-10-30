'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Mail,
  Eye,
  EyeOff,
  Crown,
  Briefcase,
  Headphones,
  ArrowLeft,
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
  activeColor: string;
  iconColor: string;
}

const ROLE_CONFIGS: Record<LoginRole, RoleConfig> = {
  superadmin: {
    role: 'superadmin',
    title: 'Super Admin Portal',
    subtitle: 'Store Owner & Operations Master Control',
    defaultUsername: 'admin',
    staffName: 'Sumant Kumar (Owner)',
    badge: 'Root Super Admin',
    icon: Crown,
    activeColor: 'bg-terracotta-700 text-white border-amber-400 shadow-md',
    iconColor: 'text-amber-300',
  },
  manager: {
    role: 'manager',
    title: 'Store Manager Portal',
    subtitle: 'Products, Inventory, Orders & Marketing',
    defaultUsername: 'manager',
    staffName: 'Devanand Mandal',
    badge: 'Store Manager',
    icon: Briefcase,
    activeColor: 'bg-indigo-700 text-white border-indigo-300 shadow-md',
    iconColor: 'text-indigo-300',
  },
  support: {
    role: 'support',
    title: 'Support Desk Portal',
    subtitle: 'Courier Tracking, Customer Support & Reviews',
    defaultUsername: 'support',
    staffName: 'Crafts Support Lead',
    badge: 'Support Staff',
    icon: Headphones,
    activeColor: 'bg-emerald-700 text-white border-emerald-300 shadow-md',
    iconColor: 'text-emerald-300',
  },
};

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin/dashboard';
  const [selectedRole, setSelectedRole] = useState<LoginRole>('superadmin');
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [channel, setChannel] = useState<'mobile' | 'email'>('mobile');
  const [otp, setOtp] = useState('');
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);
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

  // Handle Role Switching
  const handleSelectRole = (role: LoginRole) => {
    setSelectedRole(role);
    setUsername(ROLE_CONFIGS[role].defaultUsername);
    setPassword('');
    setError(null);
    setDispatchNotice(null);
  };

  // Standard Password Submit
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
        setDispatchNotice(data.message || `Security OTP dispatched to your registered ${data.channel === 'email' ? 'Email' : 'Phone'}.`);
      } else {
        // Direct password login success!
        router.push(redirectTarget);
        router.refresh();
      }
    } catch {
      setError('Login request failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password or Request 2FA OTP via Email/Mobile
  const handleForgotAdminPassword = async (targetChannel: 'email' | 'mobile' = 'email') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          channel: targetChannel,
          step: 'switch_channel',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to dispatch 2FA OTP to Admin');
      } else {
        setVerifiedUser({
          id: 'admin',
          name: activeConfig.staffName,
          username,
          role: selectedRole,
          maskedPhone: '+91 88*** ***07',
          maskedEmail: data.maskedTarget || 'sumantku2509@zohomail.in',
          phone: '+91 8878112007',
          email: 'sumantku2509@zohomail.in',
        });
        setStep('otp');
        setChannel(targetChannel);
        setDispatchNotice(data.message || `Security OTP sent to your registered Email (Zoho Mail & Gmail)!`);
      }
    } catch {
      setError('Failed to dispatch Admin OTP. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Submission
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
        router.push(redirectTarget);
        router.refresh();
      }
    } catch {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP to Email or Mobile
  const handleResendOtp = async (targetChannel: 'email' | 'mobile' = 'email') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          channel: targetChannel,
          step: 'resend_otp',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChannel(targetChannel);
        setDispatchNotice(data.message || `Fresh 6-digit Security OTP dispatched to your registered ${targetChannel === 'mobile' ? 'Mobile' : 'Email (Zoho Mail & Gmail)'}.`);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError('Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = activeConfig.icon;

  return (
    <div className="min-h-screen bg-[#1d120c] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-craft-200 selection:bg-amber-500 selection:text-black">
      {/* Background Subtle Ambient Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-terracotta-700/15 blur-[100px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header with Rich Terracotta Badge */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-block group mb-3">
            <img
              src="/images/home_warrior_logo.jpg"
              alt="Home Warrior Logo"
              className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-amber-300/90 shadow-2xl shadow-terracotta-950/80 group-hover:scale-105 transition-transform duration-200"
            />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl font-serif">
            Home Warrior Admin
          </h1>
          <p className="mt-1 text-xs font-semibold text-amber-300 uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span>{activeConfig.badge}</span>
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            <span className="text-craft-300">{activeConfig.title}</span>
          </p>
        </div>

        {/* Main Dark Terracotta Card */}
        <div className="bg-[#2b1b14] py-8 px-6 shadow-2xl rounded-3xl sm:px-9 border border-[#4d3224]">
          
          {/* Role Segmented Controller */}
          {step === 'password' && (
            <div className="mb-6 p-1.5 bg-[#1d120c] rounded-2xl flex items-center gap-1.5 border border-[#4d3224] shadow-inner">
              <button
                type="button"
                onClick={() => handleSelectRole('superadmin')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'superadmin'
                    ? 'bg-terracotta-700 text-white border border-amber-300 shadow-md font-black'
                    : 'text-craft-400 hover:text-white hover:bg-[#2b1b14]'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Owner</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('manager')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'manager'
                    ? 'bg-indigo-700 text-white border border-indigo-300 shadow-md font-black'
                    : 'text-craft-400 hover:text-white hover:bg-[#2b1b14]'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-indigo-300" />
                <span>Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('support')}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'support'
                    ? 'bg-emerald-700 text-white border border-emerald-300 shadow-md font-black'
                    : 'text-craft-400 hover:text-white hover:bg-[#2b1b14]'
                }`}
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-300" />
                <span>Support</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 bg-red-950/80 border border-red-600 text-red-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Dispatch Notice Banner */}
          {dispatchNotice && (
            <div className="mb-5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{dispatchNotice}</span>
            </div>
          )}

          {step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Account Identifier Info */}
              <div className="bg-[#1d120c] border border-[#4d3224] rounded-2xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-300 flex items-center justify-center font-bold border border-amber-500/25">
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{activeConfig.staffName}</p>
                    <p className="text-[11px] text-craft-400 font-mono">@{activeConfig.defaultUsername}</p>
                  </div>
                </div>
                <span className="text-[10px] bg-[#2b1b14] border border-[#4d3224] text-amber-300 font-bold px-2 py-0.5 rounded-lg shadow-sm">
                  Active Profile
                </span>
              </div>

              {/* Username Input with High Contrast Styling */}
              <div>
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5">
                  Admin Username or Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin or sumantku2509@zohomail.in"
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full pl-10 pr-3.5 py-3 rounded-xl border-2 border-craft-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-500 shadow-inner font-mono"
                  />
                </div>
              </div>

              {/* Password Input with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleForgotAdminPassword('email')}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-craft-300 text-xs font-bold text-gray-900 focus:outline-none focus:border-amber-500 shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1 z-10"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Primary Sign In Button in Rich Terracotta */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-terracotta-950/50 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 uppercase tracking-wider mt-2 border border-amber-300/30"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Admin Dashboard</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>

              {/* Login with Email OTP option */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => handleForgotAdminPassword('email')}
                  disabled={loading}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center justify-center gap-1.5 mx-auto hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Receive 6-digit Login Code on Email instead</span>
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Clean 2FA OTP Screen */
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center py-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center mx-auto mb-2 font-bold shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Enter Security Code</h3>
                <p className="text-xs text-craft-400 mt-1 max-w-xs mx-auto">
                  A 6-digit verification code was dispatched to your Email inbox (Zoho Mail & Gmail).
                </p>
              </div>

              {/* OTP Input Field */}
              <div>
                <label className="block text-xs font-bold text-craft-200 uppercase tracking-wider mb-1.5 text-center">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    style={{ color: '#1d120c', backgroundColor: '#ffffff' }}
                    className="w-full py-3.5 px-4 text-center rounded-2xl border-2 border-amber-500 text-2xl font-black font-mono tracking-[0.5em] text-gray-900 focus:outline-none focus:ring-4 focus:ring-amber-500/30 shadow-inner"
                  />
                </div>
              </div>

              {/* Verify OTP Button */}
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs shadow-md flex items-center justify-center gap-2 transition-all uppercase tracking-wider border border-amber-300/30"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Code & Open Dashboard</span>
                  </>
                )}
              </button>

              {/* Secondary Navigation */}
              <div className="flex flex-col gap-2 pt-2 text-xs">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep('password')}
                    className="text-craft-400 hover:text-white flex items-center gap-1 font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Password Login</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleResendOtp('email')}
                    disabled={loading}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/30"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-300" />
                    <span>Resend to Email</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-6 pt-5 border-t border-[#4d3224] flex items-center justify-between text-xs text-craft-400">
            <Link
              href="/"
              className="hover:text-white flex items-center gap-1.5 transition-colors font-medium"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>

            <span className="text-[11px] text-craft-500">
              🔒 256-bit SSL Secured
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-craft-950 flex items-center justify-center text-white text-xs">Loading Admin Portal...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
