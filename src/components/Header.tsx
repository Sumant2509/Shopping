'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  Phone, 
  Truck, 
  Sparkles, 
  ShieldCheck,
  Heart,
  ChevronDown,
  User
} from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { formatPrice, generateWhatsAppLink } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, subtotal, setIsCartDrawerOpen, freeShippingThreshold } = useCart();
  const { customer } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isCurrent = (path: string) => pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Shop All', href: '/shop' },
    { name: 'Flower Mats', href: '/shop?shape=flower', highlight: true },
    { name: 'Round Mats', href: '/shop?shape=round' },
    { name: 'Customize Your Own ✨', href: '/customize', highlight: true },
    { name: 'About Us', href: '/about' },
    { name: 'Track Order', href: '/track-order' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-craft-200 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-terracotta-800 via-terracotta-700 to-terracotta-900 text-white text-xs sm:text-sm py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0 font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Direct from Maker (Sumant Kumar) • 100% Handmade in India • Free Shipping on ₹{freeShippingThreshold}+</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-xs text-amber-100">
            <a 
              href={generateWhatsAppLink('918878112007', 'Namaste! I would like to inquire about your handmade doormats.')}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Order on WhatsApp: +91 8878112007</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-craft-800 hover:bg-craft-100 transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-start">
            <Link href="/" className="group flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-terracotta-600 to-terracotta-800 flex items-center justify-center text-white shadow-warm border-2 border-amber-300">
                <span className="font-serif font-bold text-xl tracking-tighter">HW</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl sm:text-2xl text-craft-900 tracking-tight leading-none group-hover:text-terracotta-700 transition-colors">
                  Home-Warrior
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-terracotta-700 mt-1">
                  Handmade Indian Doormats
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  isCurrent(link.href)
                    ? 'text-terracotta-700 bg-terracotta-50 font-semibold'
                    : 'text-craft-800 hover:text-terracotta-700 hover:bg-craft-50'
                } ${link.highlight ? 'text-terracotta-700 font-semibold flex items-center gap-1' : ''}`}
              >
                {link.name}
                {link.highlight && (
                  <span className="bg-terracotta-100 text-terracotta-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                    Hot
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account & Register Buttons */}
            {customer ? (
              <Link
                href="/account/profile"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-craft-700 hover:bg-craft-100 transition-colors text-sm font-medium"
                title={`Hi, ${customer.name}`}
              >
                <User className="w-4 h-4 text-terracotta-600" />
                <span className="max-w-[80px] truncate">{customer.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-1">
                <Link
                  href="/account/login"
                  className="px-2.5 py-1.5 rounded-lg text-craft-700 hover:text-terracotta-700 hover:bg-craft-100 transition-colors text-xs font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/account/register"
                  className="px-2.5 py-1.5 rounded-lg bg-terracotta-50 text-terracotta-700 hover:bg-terracotta-100 transition-colors text-xs font-semibold border border-terracotta-200"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-full text-craft-800 hover:bg-craft-100 transition-colors relative"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart Trigger */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="flex items-center gap-2.5 bg-gradient-to-r from-terracotta-700 to-terracotta-800 text-white px-3.5 sm:px-4 py-2.5 rounded-full shadow-warm hover:shadow-warm-lg hover:from-terracotta-800 hover:to-terracotta-900 transition-all group"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-craft-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline-block font-semibold text-sm">
                {totalItems > 0 ? formatPrice(subtotal) : 'Cart'}
              </span>
            </button>
          </div>
        </div>

        {/* Expandable Search Bar */}
        {searchOpen && (
          <div className="py-3 px-2 border-t border-craft-200 animate-fadeIn">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
                <input
                  type="text"
                  placeholder="Search flower mats, round mats, colors, cotton doormats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:border-terracotta-500 text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-terracotta-700 hover:bg-terracotta-800 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="text-craft-500 hover:text-craft-800 p-2 text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-craft-200 bg-white px-4 pt-3 pb-6 shadow-xl animate-fadeIn">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-2.5 rounded-lg text-base font-medium flex items-center justify-between ${
                  isCurrent(link.href)
                    ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                    : 'text-craft-800 hover:bg-craft-50'
                }`}
              >
                <span>{link.name}</span>
                {link.highlight && (
                  <span className="bg-terracotta-100 text-terracotta-800 text-xs px-2 py-0.5 rounded-full font-bold">
                    HOT
                  </span>
                )}
              </Link>
            ))}
            <div className="pt-4 border-t border-craft-200 mt-2 flex flex-col gap-2.5">
              {customer ? (
                <Link
                  href="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 bg-craft-50 text-craft-800 rounded-xl font-medium text-sm"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-terracotta-600" />
                    My Account ({customer.name})
                  </span>
                  <span className="text-xs text-craft-500">View Profile →</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-craft-100 text-craft-800 rounded-xl font-medium text-sm hover:bg-craft-200"
                  >
                    <User className="w-4 h-4" />
                    Sign In
                  </Link>
                  <Link
                    href="/account/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-terracotta-600 text-white rounded-xl font-medium text-sm hover:bg-terracotta-700 shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}

              <a
                href={generateWhatsAppLink('918878112007', 'Namaste! I would like to order handmade doormats.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl font-medium text-sm"
              >
                <Phone className="w-4 h-4" />
                WhatsApp Order: +91 8878112007
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
