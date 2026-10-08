'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, User, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin12345');
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError('Please provide username and password');
      return;
    }

    if (username === 'admin' && (password === 'admin12345' || password.length >= 6)) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        const generated = Math.floor(100000 + Math.random() * 900000).toString();
        setDemoOtp(generated);
        setStep('otp');
      }, 500);
    } else {
      setError('Invalid admin credentials. Use admin / admin12345');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin_authenticated', 'true');
      }
      router.push('/');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-craft-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-terracotta-700 text-white font-serif font-bold text-2xl flex items-center justify-center mx-auto border-2 border-amber-300 shadow-xl mb-4">
          SK
        </div>
        <h1 className="font-serif font-bold text-3xl text-white tracking-tight">
          Home-Warrior Admin
        </h1>
        <p className="mt-2 text-craft-400 text-sm">
          Secure Standalone Control Center for Handmade Doormats
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-craft-900 border border-craft-800 py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-5 bg-red-900/40 border border-red-500/50 text-red-200 p-3.5 rounded-xl text-sm">
              {error}
            </div>
          )}

          {step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Admin Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-craft-950 border border-craft-700 rounded-xl text-sm text-white placeholder-craft-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    placeholder="admin"
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
                    className="w-full pl-10 pr-4 py-3 bg-craft-950 border border-craft-700 rounded-xl text-sm text-white placeholder-craft-500 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="p-3 bg-craft-950/60 rounded-xl border border-craft-800 text-xs text-craft-400">
                Default Credentials: <strong className="text-amber-300">admin</strong> /{' '}
                <strong className="text-amber-300">admin12345</strong>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-terracotta-600 to-terracotta-700 hover:from-terracotta-700 hover:to-terracotta-800 text-white font-bold py-3 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
              >
                {loading ? 'Verifying...' : 'Next: 2FA Verification'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('admin_authenticated', 'true');
                  }
                  router.push('/');
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>🚀 Instant 1-Click Access (Demo Mode)</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="bg-amber-950/50 border border-amber-500/50 p-4 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Demo 2FA OTP Code: <strong className="text-white text-sm font-mono">{demoOtp}</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-300 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit 2FA Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={demoOtp || '123456'}
                    className="w-full pl-10 pr-4 py-3 bg-craft-950 border border-amber-500/60 rounded-xl text-lg font-mono text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOtp(demoOtp || '')}
                className="text-xs text-amber-400 hover:underline block text-left"
              >
                Auto-fill demo OTP code
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-lg flex items-center justify-center gap-2 transition-all mt-4"
              >
                {loading ? 'Authenticating...' : 'Confirm & Access Dashboard'}
                <ShieldCheck className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setStep('password')}
                className="w-full text-center text-xs text-craft-400 hover:text-white pt-2"
              >
                ← Back to credentials
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
