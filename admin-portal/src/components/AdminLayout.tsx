'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeStatus, setStoreStatus] = useState<'connected' | 'offline'>('connected');

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products Catalog', href: '/products', icon: Package },
    { name: 'Customer Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Coupons & Offers', href: '/coupons', icon: Tag },
    { name: 'Store Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_authenticated');
    }
    router.push('/login');
  };

  const storeUrl = process.env.NEXT_PUBLIC_STORE_API_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-craft-50 flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-craft-950 text-white p-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-terracotta-600 flex items-center justify-center font-bold text-sm text-white">
            SK
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none text-white">Home-Warrior</h1>
            <p className="text-[10px] text-amber-300">Admin Control Center</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-craft-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-craft-950 text-craft-200 z-40 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="p-6 border-b border-craft-900 hidden lg:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-600 flex items-center justify-center font-bold text-lg text-white shadow-md">
              SK
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-wide">Home-Warrior</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs text-amber-300 font-medium">Admin Portal</span>
              </div>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-terracotta-600 text-white shadow-md font-semibold'
                      : 'text-craft-300 hover:bg-craft-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-craft-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-craft-900 space-y-3">
          {/* Storefront Link */}
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-craft-900 hover:bg-craft-800 text-craft-300 hover:text-white text-xs font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              <span>Open Storefront</span>
            </span>
            <span className="text-[10px] bg-craft-800 text-craft-400 px-1.5 py-0.5 rounded">Live</span>
          </a>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0">
        {/* Top bar on desktop */}
        <header className="bg-white border-b border-craft-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-craft-900 tracking-tight">{title}</h1>
            <p className="text-xs text-craft-500">Home-Warrior Independent Management System</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Backend Connected</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-craft-200">
              <div className="w-8 h-8 rounded-full bg-terracotta-100 text-terracotta-800 flex items-center justify-center font-bold text-xs">
                AD
              </div>
              <div className="hidden md:block text-left text-xs">
                <p className="font-semibold text-craft-900 leading-tight">Admin</p>
                <p className="text-craft-500 text-[10px]">admin@handmade.in</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
