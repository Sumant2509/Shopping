'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, Store, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(form.name, form.email, form.phone, form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registration failed');
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/account/profile'), 1500);
    }
  };

  const fields = [
    { id: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Rahul Kumar', field: 'name' },
    { id: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'you@example.com', field: 'email' },
    { id: 'phone', label: 'Mobile Number', icon: Phone, type: 'tel', placeholder: '9876543210', field: 'phone' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-craft-50 flex flex-col justify-center py-12 px-4 sm:px-6">
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 text-craft-600 hover:text-terracotta-700 transition-colors text-sm">
          <Store className="w-4 h-4" />
          <span>Sumant Crafts</span>
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-terracotta-500 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <ShoppingBag className="w-8 h-8 text-white" />
        </div>
        <h1 className="font-serif font-bold text-3xl text-craft-900">Create Account</h1>
        <p className="mt-2 text-craft-500 text-sm">Join thousands of happy doormat lovers 🏠</p>
      </div>

      {/* Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-craft-100">

          {success && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span>Account created! Redirecting to your profile...</span>
            </div>
          )}

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {fields.map(({ id, label, icon: Icon, type, placeholder, field }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                  <input
                    id={id}
                    type={type}
                    required
                    value={form[field as keyof typeof form]}
                    onChange={handleChange(field)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 border border-craft-200 rounded-xl text-sm text-craft-900 placeholder-craft-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-12 py-3 border border-craft-200 rounded-xl text-sm text-craft-900 placeholder-craft-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-craft-400 hover:text-craft-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-craft-700 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-3 border border-craft-200 rounded-xl text-sm text-craft-900 placeholder-craft-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-transparent"
                />
              </div>
            </div>

            <button
              id="customer-register-btn"
              type="submit"
              disabled={loading || success}
              className="w-full bg-gradient-to-r from-terracotta-600 to-amber-600 hover:from-terracotta-700 hover:to-amber-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl text-sm shadow-md flex items-center justify-center gap-2 transition-all mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <>
                  <span>Create My Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-craft-500">
              Already have an account?{' '}
              <Link href="/account/login" className="font-bold text-terracotta-600 hover:text-terracotta-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
