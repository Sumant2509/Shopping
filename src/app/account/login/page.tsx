'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  AlertCircle,
  ShoppingBag,
  Phone,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  ArrowLeft,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account/profile';
  const { login, refreshCustomer } = useAuth();

  // Mode: 'email_otp' | 'mobile_otp' | 'password'
  const [mode, setMode] = useState<'email_otp' | 'mobile_otp' | 'password'>('email_otp');

  // Input States
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Verification States
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otpCode, setOtpCode] = useState('');
  const [activeTarget, setActiveTarget] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend Countdown Timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Handle Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !password) {
      setError('Please enter your email and password');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(emailInput.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Invalid email or password');
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  // Handle Send OTP (Email or Mobile)
  const handleSendOtp = async (channelOverride?: 'email' | 'mobile', e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const isEmailChannel = (channelOverride || (mode === 'email_otp' ? 'email' : 'mobile')) === 'email';
    const target = isEmailChannel ? emailInput.trim() : phoneInput.trim();

    if (!target) {
      setError(isEmailChannel ? 'Please enter your email address' : 'Please enter your 10-digit mobile number');
      return;
    }

    if (isEmailChannel && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setError('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    if (!isEmailChannel && target.replace(/[^0-9]/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          target,
          channel: isEmailChannel ? 'email' : 'mobile',
          purpose: 'login',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to dispatch verification code');
      } else {
        setActiveTarget(target);
        setOtpStep('verify');
        setWhatsappUrl(data.whatsappUrl || null);
        setMaskedTarget(data.maskedTarget || target);
        setSuccessMsg(data.message || (isEmailChannel ? 'OTP sent to your email inbox!' : 'OTP sent to your phone!'));
        setResendTimer(60);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          target: activeTarget,
          otp: otpCode.trim(),
          purpose: 'login',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid or expired OTP code');
      } else {
        await refreshCustomer();
        router.push(redirect);
        router.refresh();
      }
    } catch {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-craft-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 text-craft-600 hover:text-terracotta-700 transition-colors text-sm font-semibold"
        >
          <Store className="w-4 h-4" />
          <span>Home-Warrior</span>
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta-700 to-amber-700 flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-craft-950">Customer Login</h1>
        <p className="mt-2 text-craft-600 text-sm">Instant OTP Sign In & Order Tracking</p>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-craft-200">
          {/* Mode Tabs */}
          {otpStep === 'send' && (
            <div className="grid grid-cols-3 rounded-2xl bg-craft-100/70 p-1 mb-6 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode('email_otp');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                  mode === 'email_otp'
                    ? 'bg-white text-terracotta-700 shadow-sm'
                    : 'text-craft-600 hover:text-craft-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('mobile_otp');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                  mode === 'mobile_otp'
                    ? 'bg-white text-terracotta-700 shadow-sm'
                    : 'text-craft-600 hover:text-craft-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Mobile OTP</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('password');
                  setError(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 rounded-xl transition-all flex flex-col items-center justify-center gap-1 ${
                  mode === 'password'
                    ? 'bg-white text-terracotta-700 shadow-sm'
                    : 'text-craft-600 hover:text-craft-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: EMAIL OTP LOGIN */}
          {mode === 'email_otp' && (
            otpStep === 'send' ? (
              <form onSubmit={(e) => handleSendOtp('email', e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="you@gmail.com"
                      className="w-full pl-10 pr-4 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                  <p className="text-[11px] text-craft-500 mt-1.5">
                    We will send a 6-digit verification code directly to your email inbox.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <Inbox className="w-4 h-4" />
                  <span>{loading ? 'Sending Code to Email...' : 'Send OTP to Email'}</span>
                </button>
              </form>
            ) : null
          )}

          {/* TAB 2: MOBILE / WHATSAPP OTP LOGIN */}
          {mode === 'mobile_otp' && (
            otpStep === 'send' ? (
              <form onSubmit={(e) => handleSendOtp('mobile', e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                    10-Digit Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="9876543210"
                      className="w-full pl-10 pr-4 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                  <p className="text-[11px] text-craft-500 mt-1.5">
                    We'll send your code via WhatsApp and cellular SMS.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Sending Code...' : 'Get Mobile / WhatsApp OTP'}</span>
                </button>
              </form>
            ) : null
          )}

          {/* OTP VERIFICATION VIEW (FOR BOTH EMAIL & MOBILE OTP) */}
          {otpStep === 'verify' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* WhatsApp direct delivery button (if phone OTP) */}
              {whatsappUrl && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-[11px] font-semibold text-emerald-900">
                    Get your code immediately on WhatsApp:
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Open WhatsApp to Get Code</span>
                  </a>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full pl-10 pr-4 py-3 border-2 border-terracotta-300 rounded-xl text-xl font-mono text-center tracking-[0.4em] text-craft-900 focus:outline-none focus:border-terracotta-600"
                  />
                </div>
                <p className="text-[11px] text-craft-500 mt-1.5">
                  Code sent to <strong className="text-craft-800">{maskedTarget || activeTarget}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Verifying...' : 'Verify Code & Log In'}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpStep('send');
                    setOtpCode('');
                    setError(null);
                  }}
                  className="text-xs text-craft-500 hover:text-craft-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3 h-3" /> Change Target
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={() => handleSendOtp()}
                  className="text-xs text-terracotta-700 hover:text-terracotta-800 disabled:opacity-40 flex items-center gap-1 font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PASSWORD LOGIN */}
          {mode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-craft-400 hover:text-craft-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Signing In...' : 'Sign In with Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center pt-4 border-t border-craft-100">
            <p className="text-sm text-craft-600">
              New to Home-Warrior?{' '}
              <Link href="/account/register" className="font-bold text-terracotta-700 hover:underline">
                Create an Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-craft-500">
          Loading customer portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
