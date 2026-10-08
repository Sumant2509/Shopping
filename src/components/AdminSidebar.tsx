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
  Users,
  ShieldCheck
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

  const [currentUser, setCurrentUser] = React.useState<{ name: string; username: string; role: string } | null>(null);

  React.useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(d => {
        if (d.authenticated && d.admin) setCurrentUser(d.admin);
      })
      .catch(() => {});
  }, []);

  const getRoleBadgeStyle = (role?: string) => {
    if (role === 'manager') return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    if (role === 'support') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'HW';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  // Role-based navigation items
  const operationalItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ...(currentUser?.role !== 'support'
      ? [
          { name: 'All Products', href: '/admin/products', icon: Package },
          { name: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
        ]
      : []),
    { name: 'Orders & Shipping', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    ...(currentUser?.role !== 'support'
      ? [{ name: 'Discount Coupons', href: '/admin/coupons', icon: Tag }]
      : []),
    { name: 'Reviews Moderation', href: '/admin/reviews', icon: Star },
  ];

  // Super Admin Exclusive items: ONLY for superadmin
  const superAdminOnlyItems = [
    { name: 'Admin Team & 2FA', href: '/admin/team', icon: ShieldCheck },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const isSuperAdmin = !currentUser || currentUser.role === 'superadmin';

  return (
    <aside className="w-64 bg-craft-950 text-craft-200 min-h-screen h-screen sticky top-0 flex flex-col border-r border-craft-900 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-craft-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-terracotta-700 flex items-center justify-center text-white font-serif font-bold text-lg border border-amber-300">
            HW
          </div>
          <div>
            <h2 className="font-serif font-bold text-white text-base">Home-Warrior</h2>
            <p className="text-[11px] text-amber-400 font-medium tracking-wider uppercase">
              {currentUser?.role === 'manager'
                ? 'Manager Portal'
                : currentUser?.role === 'support'
                ? 'Support Portal'
                : 'Super Admin Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {operationalItems.map((item) => {
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

        {/* Super Admin Exclusive Panel (Only visible to Super Admin) */}
        {isSuperAdmin && (
          <div className="pt-4 mt-2 border-t border-craft-900">
            <p className="px-3.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-amber-400/80">
              Super Admin Only
            </p>
            {superAdminOnlyItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href);
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
          </div>
        )}
      </nav>

      {/* Bottom Actions & User Profile */}
      <div className="p-4 border-t border-craft-900 space-y-2">
        {currentUser && (
          <div className="p-2.5 bg-craft-900/80 rounded-xl border border-craft-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-terracotta-700 text-white font-bold text-xs flex items-center justify-center shrink-0 border border-amber-300">
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <span className={`inline-block text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                {currentUser.role === 'manager' ? 'Store Manager' : currentUser.role === 'support' ? 'Support Team' : 'Super Admin'}
              </span>
            </div>
          </div>
        )}

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
