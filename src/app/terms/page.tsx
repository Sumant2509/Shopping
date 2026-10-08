import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-craft-200 shadow-warm space-y-8">
          <div className="border-b border-craft-200 pb-4">
            <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
              Legal Terms
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
              Terms & Conditions
            </h1>
            <p className="text-xs text-craft-500 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-craft-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                1. Handcrafted Product Variations
              </h2>
              <p>
                Due to the artisanal and handmade nature of our crochet and braided doormats, subtle variations in stitch texture and color tone may occur. These are natural characteristics of authentic Indian handicrafts that make each piece unique.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                2. Pricing and Availability
              </h2>
              <p>
                All prices on the website are listed in Indian Rupees (₹ INR) inclusive of applicable taxes. We reserve the right to update prices or discontinue items based on seasonal textile yarn availability.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                3. Governing Law
              </h2>
              <p>
                These terms are governed in accordance with the laws of India. Any disputes arising in connection with orders shall be subject to the exclusive jurisdiction of the courts in Durg, Chhattisgarh.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
