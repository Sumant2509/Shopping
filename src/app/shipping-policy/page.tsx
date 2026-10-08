import React from 'react';
import Link from 'next/link';
import { Truck, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-craft-200 shadow-warm space-y-8">
          <div className="border-b border-craft-200 pb-4">
            <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
              Transparent Logistics
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
              Shipping & Delivery Policy
            </h1>
            <p className="text-xs text-craft-500 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-craft-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                1. Order Processing & Dispatch Timelines
              </h2>
              <p>
                Each handmade doormat undergoes a thorough quality inspection at our workshop before dispatch. All orders are processed and handed over to our courier partners within <strong>24 to 48 hours</strong> of order confirmation.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                2. Delivery Estimates Across India
              </h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Metro Cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai):</strong> 3 to 4 business days.</li>
                <li><strong>Tier-2 & Tier-3 Cities:</strong> 4 to 5 business days.</li>
                <li><strong>Remote Locations / North-East / J&K:</strong> 5 to 7 business days.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                3. Shipping Charges
              </h2>
              <p>
                • <strong>FREE All-India Delivery:</strong> On all prepaid and COD orders of <strong>₹699 and above</strong>.<br />
                • <strong>Standard Shipping:</strong> A flat fee of ₹60 is applied on orders below ₹699.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                4. Courier Partners & Tracking
              </h2>
              <p>
                We ship through trusted Indian logistics partners including <strong>Delhivery Express, Shiprocket, and India Post Speed Post</strong>. Once dispatched, you will receive a tracking link via SMS, Email, and WhatsApp.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                5. Damaged Parcel on Delivery
              </h2>
              <p>
                If the outer shipping parcel arrives visibly damaged or tampered with, please take a quick photo and contact us immediately on WhatsApp at <strong>+91 8878112007</strong> or email <strong>mandaldevanand@gmail.com</strong>. We will arrange an immediate free replacement.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
