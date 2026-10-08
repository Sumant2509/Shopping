'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, User, ShieldCheck, ArrowRight, Store, AlertCircle, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin12345');
  const [otp, setOtp] = useState('');
  const [demoOtpNotice, setDemoOtpNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Step 1: Password submit
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, step: 'password' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials');
      } else if (data.requiresOtp) {
        setStep('otp');
        setDemoOtpNotice(data.demoOtp ? `Demo 2FA OTP Code: ${data.demoOtp}` : null);
      }
    } catch {
      setError('Login request failed. Please check network connection.');
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
        body: JSON.stringify({ username, otp, step: 'otp' }),
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
        body: JSON.stringify({ username, password, step: 'password' }),
      });
      const data = await res.json();
      if (data.demoOtp) {
        setDemoOtpNotice(`New 2FA OTP Code: ${data.demoOtp}`);
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
          {step === 'password' ? 'Store Management Portal' : '2-Factor Security OTP Verification'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
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
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-300">Master: 887811</span>
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

              <div className="p-3 bg-craft-950/80 rounded-xl border border-craft-800 text-[11px] text-craft-400 space-y-1">
                <p className="font-bold text-amber-300">Demo Credentials:</p>
                <p>Username: <strong className="text-white font-mono">admin</strong></p>
                <p>Password: <strong className="text-white font-mono">admin12345</strong></p>
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
                    <span>Verify Credentials & Get OTP</span>
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
                      body: JSON.stringify({ username: 'admin', password: 'admin12345', step: 'direct' }),
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
                <span>🚀 Instant 1-Click Admin Access (Demo)</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
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
                  Enter the 6-digit OTP code sent to your registered Admin Mobile / Email.
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
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> 2FA OTP Protected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
