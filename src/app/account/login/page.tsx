'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Store, AlertCircle, ShoppingBag, Phone, KeyRound, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account/profile';
  const { login, refreshCustomer } = useAuth();

  const [mode, setMode] = useState<'otp' | 'password'>('otp');

  // Password mode states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP mode states
  const [targetInput, setTargetInput] = useState('');
  const [otpStep, setOtpStep] = useState<'send' | 'verify'>('send');
  const [otpCode, setOtpCode] = useState('');
  const [demoOtpAlert, setDemoOtpAlert] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Password Login
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed');
    } else {
      router.push(redirect);
      router.refresh();
    }
  };

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) {
      setError('Please enter your mobile number or email');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', target: targetInput }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP');
      } else {
        setOtpStep('verify');
        setDemoOtpAlert(data.demoOtp ? `Demo OTP Code: ${data.demoOtp}` : null);
      }
    } catch {
      setError('Failed to send OTP. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP code');
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
          target: targetInput,
          otp: otpCode,
          type: 'customer',
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid OTP code');
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
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 text-craft-600 hover:text-terracotta-700 transition-colors text-sm">
          <Store className="w-4 h-4" />
          <span>Home-Warrior</span>
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-craft-900">Customer Portal</h1>
        <p className="mt-2 text-craft-500 text-sm">Fast 1-Click OTP Sign In & Order Tracking</p>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-craft-100">
          
          {/* Mode Switch Tabs */}
          <div className="flex rounded-2xl bg-craft-100/70 p-1 mb-6 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('otp'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'otp' ? 'bg-white text-terracotta-700 shadow-sm' : 'text-craft-600 hover:text-craft-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>Login via Mobile/OTP</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode('password'); setError(null); }}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'password' ? 'bg-white text-terracotta-700 shadow-sm' : 'text-craft-600 hover:text-craft-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Email & Password</span>
            </button>
          </div>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {demoOtpAlert && mode === 'otp' && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono font-bold tracking-wider">{demoOtpAlert}</span>
              </div>
              <span className="text-[10px] bg-emerald-200/60 px-2 py-0.5 rounded font-medium">Master: 123456</span>
            </div>
          )}

          {mode === 'otp' ? (
            otpStep === 'send' ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                    Mobile Number or Email
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                    <input
                      type="text"
                      required
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      placeholder="+91 9876543210 or customer@gmail.com"
                      className="w-full pl-10 pr-4 py-3 border border-craft-200 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-terracotta-600 to-amber-600 hover:from-terracotta-700 hover:to-amber-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Sending 6-Digit OTP...' : 'Get 6-Digit OTP Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                    Enter 6-Digit Verification OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full pl-10 pr-4 py-3 border border-amber-300 rounded-xl text-lg font-mono text-center tracking-widest text-craft-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <p className="text-[11px] text-craft-500 mt-1.5">
                    OTP sent to <strong className="text-craft-800">{targetInput}</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  {loading ? 'Verifying OTP...' : 'Verify OTP & Log In'}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setOtpStep('send')}
                    className="text-xs text-craft-500 hover:text-craft-800"
                  >
                    ← Change Mobile/Email
                  </button>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-terracotta-600 hover:text-terracotta-700 flex items-center gap-1 font-bold"
                  >
                    <RefreshCw className="w-3 h-3" /> Resend OTP
                  </button>
                </div>
              </form>
            )
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 border border-craft-200 rounded-xl text-sm text-craft-900 placeholder-craft-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
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
                    placeholder="Your password"
                    className="w-full pl-10 pr-12 py-3 border border-craft-200 rounded-xl text-sm text-craft-900 placeholder-craft-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
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
                className="w-full bg-gradient-to-r from-terracotta-600 to-amber-600 hover:from-terracotta-700 hover:to-amber-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-craft-500">
              New customer?{' '}
              <Link href="/account/register" className="font-bold text-terracotta-600 hover:text-terracotta-700">
                Create an account
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-craft-500">Loading customer login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
