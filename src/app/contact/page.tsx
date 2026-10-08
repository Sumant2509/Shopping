'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { generateWhatsAppLink } from '@/lib/utils';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
            Customer Support & Inquiries
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-craft-950 mt-1">
            Get in Touch with Sumant Crafts
          </h1>
          <p className="text-xs sm:text-sm text-craft-600 mt-2">
            We are always happy to help with order tracking, custom shapes, bulk orders, or product queries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">

          {/* Contact Details Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-warm space-y-6">
            <h2 className="font-serif font-bold text-xl text-craft-950 pb-3 border-b border-craft-200">
              Workshop & Support Info
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-craft-700">
              <div className="flex items-start gap-3 p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-craft-900">WhatsApp & Phone</h3>
                  <p className="text-craft-600 mt-0.5">+91 8878112007</p>
                  <a
                    href={generateWhatsAppLink('918878112007', 'Namaste Sumant ji! I need assistance with an order.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-craft-50 rounded-2xl border border-craft-200">
                <Mail className="w-5 h-5 text-terracotta-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-craft-900">Email Address</h3>
                  <a href="mailto:mandaldevanand@gmail.com" className="text-craft-600 hover:underline">
                    mandaldevanand@gmail.com
                  </a>
                  <p className="text-[11px] text-craft-400 mt-0.5">Response within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-craft-50 rounded-2xl border border-craft-200">
                <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-craft-900">Workshop & Dispatch Facility</h3>
                  <p className="text-craft-600 mt-0.5">
                    Home Warrior Handmade Doormats,<br />
                    Khursipar, Bhilai, Durg,<br />
                    Chhattisgarh - 490011, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-craft-50 rounded-2xl border border-craft-200">
                <Clock className="w-5 h-5 text-craft-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-craft-900">Support Hours</h3>
                  <p className="text-craft-600 mt-0.5">Monday to Saturday: 9:30 AM – 7:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-craft-200 shadow-warm">
            <h2 className="font-serif font-bold text-xl text-craft-950 mb-2">
              Send us a Message
            </h2>
            <p className="text-xs text-craft-500 mb-6">
              Fill out the form below and Sumant Kumar or our team will get back to you promptly.
            </p>

            {sent ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center text-emerald-900 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="font-serif font-bold text-lg">Thank You!</h3>
                <p className="text-xs text-emerald-800">
                  Your message has been received. We will contact you via WhatsApp/Phone shortly.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs font-bold text-emerald-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Message / Inquiry *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about the mat shape, quantity, or custom requirements you are looking for..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-8 py-3 rounded-full text-xs shadow-warm flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
