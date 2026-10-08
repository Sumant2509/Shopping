'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { CustomerAddress } from './types';

interface CustomerPublic {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: CustomerAddress[];
  createdAt: string;
}

interface AuthContextValue {
  customer: CustomerPublic | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshCustomer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCustomer = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setCustomer(data.customer);
          return;
        }
      }
      setCustomer(null);
    } catch {
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    refreshCustomer().finally(() => setLoading(false));
  }, [refreshCustomer]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setCustomer(data.customer);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setCustomer(data.customer);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCustomer(null);
  };

  return (
    <AuthContext.Provider value={{ customer, loading, login, register, logout, refreshCustomer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
