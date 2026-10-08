'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  Tag, 
  Star, 
  Settings, 
  LogOut, 
  ExternalLink,
  Store,
  Users
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      router.push('/admin/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'All Products', href: '/admin/products', icon: Package },
    { name: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
    { name: 'Orders & Shipping', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Discount Coupons', href: '/admin/coupons', icon: Tag },
    { name: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-craft-950 text-craft-200 min-h-screen flex flex-col border-r border-craft-900 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-craft-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta-700 flex items-center justify-center text-white font-serif font-bold text-lg border border-amber-300">
            SK
          </div>
          <div>
            <h2 className="font-serif font-bold text-white text-base">Sumant Crafts</h2>
            <p className="text-[11px] text-amber-400 font-medium tracking-wider uppercase">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href) && item.href !== '/admin/products');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-terracotta-700 text-white shadow-sm'
                  : 'text-craft-400 hover:text-white hover:bg-craft-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-craft-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-craft-900 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-craft-300 hover:text-white hover:bg-craft-900 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>View Live Website</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-craft-500" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
