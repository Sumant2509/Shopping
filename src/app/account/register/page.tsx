'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  Store,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  KeyRound,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { refreshCustomer } = useAuth();

  const [step, setStep] = useState<'form' | 'verify'>('form');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // OTP Verification states
  const [otpCode, setOtpCode] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  // STEP 1: Submit Details & Send Verification OTP
  const handleInitiateRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Validation
    if (!form.name.trim()) {
      setError('Please enter your full name');
      return;
    }

    const cleanPhone = form.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          target: cleanPhone,
          purpose: 'register',
          name: form.name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to dispatch verification code');
      } else {
        setStep('verify');
        setWhatsappUrl(data.whatsappUrl || null);
        setMaskedTarget(data.maskedTarget || cleanPhone);
        setResendTimer(60);
      }
    } catch {
      setError('Network error. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP & Create Account
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanPhone = form.phone.replace(/[^0-9]/g, '');
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          target: cleanPhone,
          otp: otpCode.trim(),
          purpose: 'register',
          registrationData: {
            name: form.name.trim(),
            email: form.email.toLowerCase().trim(),
            phone: cleanPhone,
            password: form.password,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid or expired OTP code');
      } else {
        setSuccess(true);
        await refreshCustomer();
        setTimeout(() => router.push('/account/profile'), 1200);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-craft-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      {/* Header */}
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
        <h1 className="font-serif font-bold text-3xl text-craft-950">
          {step === 'form' ? 'Create Customer Account' : 'Verify Mobile OTP'}
        </h1>
        <p className="mt-2 text-craft-600 text-sm">
          {step === 'form'
            ? 'Join Home-Warrior for faster checkout and artisan updates'
            : 'Enter the 6-digit security code sent to your phone'}
        </p>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-craft-200">
          {/* Notifications */}
          {success && (
            <div className="mb-5 bg-green-50 border border-green-300 text-green-800 p-4 rounded-2xl flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              <span>Account verified & created! Redirecting to profile...</span>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {step === 'form' ? (
            <form onSubmit={handleInitiateRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange('name')}
                    placeholder="Rahul Sharma"
                    className="w-full pl-10 pr-4 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (For WhatsApp / SMS OTP) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange('phone')}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange('email')}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={handleChange('password')}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-2.5 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-craft-400"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                    Confirm *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-warm flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>{loading ? 'Sending Verification Code...' : 'Verify Mobile & Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2: OTP Verification */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {/* WhatsApp direct delivery button */}
              {whatsappUrl && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-[11px] font-semibold text-emerald-900">
                    Get your verification code instantly on WhatsApp:
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
                  Code sent to <strong className="text-craft-800">{maskedTarget || form.phone}</strong>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Verifying...' : 'Verify Code & Complete Registration'}</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setOtpCode('');
                    setError(null);
                  }}
                  className="text-xs text-craft-500 hover:text-craft-800 flex items-center gap-1 font-medium"
                >
                  <ArrowLeft className="w-3 h-3" /> Edit Details
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || loading}
                  onClick={() => handleInitiateRegister()}
                  className="text-xs text-terracotta-700 hover:text-terracotta-800 disabled:opacity-40 flex items-center gap-1 font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center pt-4 border-t border-craft-100">
            <p className="text-sm text-craft-600">
              Already have an account?{' '}
              <Link href="/account/login" className="font-bold text-terracotta-700 hover:underline">
                Sign in with OTP / Password
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
