import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-craft-200 shadow-warm space-y-8">
          <div className="border-b border-craft-200 pb-4">
            <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
              Hassle-Free Protection
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
              Returns & Replacement Policy
            </h1>
            <p className="text-xs text-craft-500 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-craft-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                1. 7-Day Replacement Guarantee
              </h2>
              <p>
                We stand firmly behind the quality of our handcrafted doormats. If you receive a product that is damaged during transit, defective in stitching, or different from what you ordered, you can request a <strong>free replacement or full refund within 7 days</strong> of delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                2. Return Conditions
              </h2>
              <p>
                To be eligible for a replacement or return:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The doormat must be unused and in the original condition with tags attached.</li>
                <li>You must provide your Order Number and photos/video showing the issue via WhatsApp (+91 8878112007) or Email.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                3. Refund Processing
              </h2>
              <p>
                Once approved, refunds for prepaid orders (UPI / Cards / NetBanking) are credited back to the original payment source within <strong>3 to 5 business days</strong>. For Cash on Delivery orders, refunds are transferred directly via UPI or direct bank transfer.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                4. How to Initiate a Return
              </h2>
              <p>
                Simply message us on WhatsApp at <strong>+91 8878112007</strong> or email <strong>mandaldevanand@gmail.com</strong> with your Order ID. Our support team will assist you within 24 hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
