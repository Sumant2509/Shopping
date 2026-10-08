import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-craft-200 shadow-warm space-y-8">
          <div className="border-b border-craft-200 pb-4">
            <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
              Order Modifications
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
              Cancellation Policy
            </h1>
            <p className="text-xs text-craft-500 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-craft-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                1. Cancellation Before Dispatch
              </h2>
              <p>
                You can cancel your order free of charge at any time before it is dispatched from our workshop (typically within 24 hours of placing the order). To cancel, message us on WhatsApp at <strong>+91 8878112007</strong> or email <strong>mandaldevanand@gmail.com</strong> with your Order Number.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                2. Refund for Cancelled Orders
              </h2>
              <p>
                If an order is cancelled prior to shipment, 100% of the payment will be refunded to your original payment method (UPI / Card / NetBanking) within <strong>3 to 5 business days</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                3. Cancellation After Dispatch
              </h2>
              <p>
                Once an order has been handed over to the courier partner and an AWB tracking number is generated, it cannot be cancelled in transit. You can choose to reject the package at doorstep or initiate a 7-day replacement/return after delivery.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
