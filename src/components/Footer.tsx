'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="bg-craft-950 text-craft-200 pt-16 pb-12 border-t border-craft-900">
      {/* Value Proposition Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 pb-12 border-b border-craft-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-terracotta-900/60 border border-terracotta-700/50 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">100% Handmade</h4>
              <p className="text-xs text-craft-400 mt-1">Hand-braided & stitched by home-based Indian artisans.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-terracotta-900/60 border border-terracotta-700/50 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">All-India Delivery</h4>
              <p className="text-xs text-craft-400 mt-1">Reliable shipping via Delhivery & India Post with live tracking.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-terracotta-900/60 border border-terracotta-700/50 flex items-center justify-center text-amber-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Direct From Maker</h4>
              <p className="text-xs text-craft-400 mt-1">No middleman margins. Premium quality at honest prices.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-terracotta-900/60 border border-terracotta-700/50 flex items-center justify-center text-amber-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">7-Day Replacement</h4>
              <p className="text-xs text-craft-400 mt-1">Hassle-free replacement for any transit damage or defect.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Story */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-terracotta-700 flex items-center justify-center text-white font-serif font-bold text-lg border border-amber-300">
              SK
            </div>
            <div>
              <span className="font-serif font-bold text-xl text-white">Sumant Crafts</span>
              <p className="text-xs text-amber-400">Handmade Indian Doormats & Mats</p>
            </div>
          </div>
          <p className="text-sm text-craft-400 leading-relaxed max-w-sm mb-6">
            Handcrafted with devotion by Sumant Kumar and skilled local artisans in India. Bringing warmth, vibrant colors, and durable handcrafted beauty to Indian doorways and homes.
          </p>
          <div className="flex flex-col gap-2.5 text-xs text-craft-300">
            <a 
              href={generateWhatsAppLink('918878112007', 'Namaste Sumant ji! I want to inquire about handmade mats.')}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp / Call: +91 8878112007</span>
            </a>
            <a 
              href="mailto:mandaldevanand@gmail.com" 
              className="flex items-center gap-2.5 hover:text-amber-300 transition-colors"
            >
              <Mail className="w-4 h-4 text-terracotta-400" />
              <span>mandaldevanand@gmail.com</span>
            </a>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Workshop: Home Warrior Handmade Doormats, Khursipar, Bhilai, Durg, Chhattisgarh - 490011, India</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4 text-amber-200">
            Shop Shapes
          </h4>
          <ul className="space-y-2.5 text-sm text-craft-400">
            <li>
              <Link href="/shop?shape=flower" className="hover:text-amber-300 transition-colors flex items-center justify-between">
                <span>Flower Shaped Mats</span>
                <span className="text-[10px] bg-terracotta-900 text-terracotta-300 px-1.5 py-0.5 rounded">Popular</span>
              </Link>
            </li>
            <li>
              <Link href="/shop?shape=round" className="hover:text-amber-300 transition-colors">
                Round Braided Mats
              </Link>
            </li>
            <li>
              <Link href="/customize" className="hover:text-amber-300 transition-colors text-amber-300 font-bold flex items-center gap-1">
                Customize Your Own ✨
              </Link>
            </li>
            <li>
              <Link href="/shop?shape=rectangle" className="hover:text-amber-300 transition-colors">
                Classic Rectangular
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-amber-300 transition-colors font-medium text-amber-400">
                Explore All Products →
              </Link>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4 text-amber-200">
            Customer Care
          </h4>
          <ul className="space-y-2.5 text-sm text-craft-400">
            <li>
              <Link href="/account/register" className="hover:text-amber-300 transition-colors text-amber-300/90 font-medium">
                Create Account (Register) ✨
              </Link>
            </li>
            <li>
              <Link href="/account/login" className="hover:text-amber-300 transition-colors">
                Customer Sign In
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-amber-300 transition-colors">
                Track Your Order
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-amber-300 transition-colors">
                About Our Workshop
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-300 transition-colors">
                Contact & Support
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" className="hover:text-amber-300 transition-colors">
                Shipping & Delivery
              </Link>
            </li>
            <li>
              <Link href="/refund-policy" className="hover:text-amber-300 transition-colors">
                Returns & Replacement
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Policies */}
        <div>
          <h4 className="font-semibold text-white text-sm tracking-wider uppercase mb-4 text-amber-200">
            Policies
          </h4>
          <ul className="space-y-2.5 text-sm text-craft-400">
            <li>
              <Link href="/privacy-policy" className="hover:text-amber-300 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-amber-300 transition-colors">
                Terms & Conditions
              </Link>
            </li>
            <li>
              <Link href="/cancellation-policy" className="hover:text-amber-300 transition-colors">
                Cancellation Policy
              </Link>
            </li>
          </ul>

          <div className="mt-6 pt-4 border-t border-craft-900">
            <p className="text-xs text-craft-400 mb-2 font-medium">Also available on:</p>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-craft-900 px-2.5 py-1 rounded text-craft-300 border border-craft-800">
                Amazon India
              </span>
              <span className="text-xs bg-craft-900 px-2.5 py-1 rounded text-craft-300 border border-craft-800">
                Flipkart
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Badges & Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-8 border-t border-craft-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-craft-400">
          <span className="font-medium text-craft-300 mr-2">100% Safe Payments:</span>
          <span className="px-2 py-1 bg-craft-900 rounded border border-craft-800 text-craft-300 font-semibold text-[11px]">UPI (GPay / PhonePe / Paytm)</span>
          <span className="px-2 py-1 bg-craft-900 rounded border border-craft-800 text-craft-300 font-semibold text-[11px]">RuPay</span>
          <span className="px-2 py-1 bg-craft-900 rounded border border-craft-800 text-craft-300 font-semibold text-[11px]">Visa / Mastercard</span>
          <span className="px-2 py-1 bg-craft-900 rounded border border-craft-800 text-craft-300 font-semibold text-[11px]">Net Banking</span>
          <span className="px-2 py-1 bg-craft-900 rounded border border-craft-800 text-craft-300 font-semibold text-[11px]">Cash on Delivery</span>
        </div>

        <p className="text-xs text-craft-400 text-center md:text-right">
          © {new Date().getFullYear()} Sumant Crafts • Handcrafted with love by Sumant Kumar in India.
        </p>
      </div>
    </footer>
  );
}
