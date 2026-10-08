'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  AlertCircle,
  Phone,
  KeyRound,
  CheckCircle2,
  RefreshCw,
  MessageCircle,
  ArrowLeft,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

function ForgotPasswordForm() {
  const router = useRouter();
  const { refreshCustomer } = useAuth();

  // Mode: 'email' | 'mobile'
  const [channel, setChannel] = useState<'email' | 'mobile'>('email');

  // Input states
  const [emailInput, setEmailInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Step: 'request' | 'reset' | 'success'
  const [step, setStep] = useState<'request' | 'reset' | 'success'>('request');

  // Reset states
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Target info
  const [activeTarget, setActiveTarget] = useState('');
  const [maskedTarget, setMaskedTarget] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);

  // Feedback states
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

  // Handle Request Reset OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = channel === 'email';
    const target = isEmail ? emailInput.trim() : phoneInput.trim();

    if (!target) {
      setError(isEmail ? 'Please enter your registered email' : 'Please enter your 10-digit mobile number');
      return;
    }

    if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      setError('Please enter a valid email address (e.g. name@gmail.com)');
      return;
    }

    if (!isEmail && target.replace(/[^0-9]/g, '').length < 10) {
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
          channel: isEmail ? 'email' : 'mobile',
          purpose: 'forgot_password',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to dispatch password reset code');
      } else {
        setActiveTarget(target);
        setMaskedTarget(data.maskedTarget || target);
        setWhatsappUrl(data.whatsappUrl || null);
        setStep('reset');
        setSuccessMsg(data.message || 'Verification code sent successfully!');
        setResendTimer(60);
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP & Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
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
          purpose: 'forgot_password',
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to reset password. Please verify the code.');
      } else {
        setStep('success');
        await refreshCustomer();
        setTimeout(() => {
          router.push('/account/profile');
          router.refresh();
        }, 2200);
      }
    } catch {
      setError('An error occurred during password reset. Please try again.');
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
          <KeyRound className="w-8 h-8" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-craft-950">Reset Password</h1>
        <p className="mt-2 text-craft-600 text-sm">
          {step === 'request'
            ? 'Verify your registered contact to create a new password'
            : step === 'reset'
            ? 'Enter the 6-digit code and set your new password'
            : 'Password updated successfully!'}
        </p>
      </div>

      {/* Main Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-craft-200">
          {/* Feedback messages */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && step !== 'success' && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 'request' && (
            <div>
              {/* Channel Tabs */}
              <div className="grid grid-cols-2 rounded-2xl bg-craft-100/70 p-1 mb-6 text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setChannel('email');
                    setError(null);
                  }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    channel === 'email'
                      ? 'bg-white text-terracotta-700 shadow-sm'
                      : 'text-craft-600 hover:text-craft-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Verification</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setChannel('mobile');
                    setError(null);
                  }}
                  className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    channel === 'mobile'
                      ? 'bg-white text-terracotta-700 shadow-sm'
                      : 'text-craft-600 hover:text-craft-900'
                  }`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Mobile / WhatsApp</span>
                </button>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-4">
                {channel === 'email' ? (
                  <div>
                    <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                      Registered Email Address
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
                      We will send a 6-digit password reset code to your email inbox.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                      Registered 10-Digit Mobile Number
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
                      We will send your verification code via SMS and WhatsApp.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Sending Reset Code...' : 'Send Password Reset Code'}</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFY CODE & SET NEW PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
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

              {/* OTP Code */}
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Enter 6-Digit Code
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

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-12 py-3 border border-craft-300 rounded-xl text-sm text-craft-900 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-craft-400 hover:text-craft-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-[11px] text-red-600 mt-1">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6 || newPassword.length < 6 || newPassword !== confirmPassword}
                className="w-full bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm shadow-warm flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{loading ? 'Updating Password...' : 'Reset Password & Log In'}</span>
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('request');
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
                  onClick={(e) => handleRequestOtp(e)}
                  className="text-xs text-terracotta-700 hover:text-terracotta-800 disabled:opacity-40 flex items-center gap-1 font-bold"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="font-bold text-xl text-craft-950">Password Successfully Changed!</h2>
              <p className="text-sm text-craft-600">
                Your new password has been saved. We are automatically logging you into your account...
              </p>
              <div className="pt-2">
                <Link
                  href="/account/profile"
                  className="inline-flex items-center gap-2 bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold py-3 px-6 rounded-xl text-sm shadow-sm transition-all"
                >
                  <span>Go to My Profile</span>
                </Link>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-6 text-center pt-4 border-t border-craft-100 flex items-center justify-between text-xs text-craft-600">
            <Link href="/account/login" className="font-semibold text-terracotta-700 hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Login
            </Link>
            <Link href="/account/register" className="font-semibold text-craft-700 hover:text-terracotta-700 hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-craft-500">
          Loading reset portal...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
