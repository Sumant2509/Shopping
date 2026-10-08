import React from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-craft-200 shadow-warm space-y-8">
          <div className="border-b border-craft-200 pb-4">
            <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">
              Data Protection
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
              Privacy Policy
            </h1>
            <p className="text-xs text-craft-500 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-6 text-xs sm:text-sm text-craft-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                1. Information We Collect
              </h2>
              <p>
                When you purchase from Sumant Crafts or browse our website, we collect necessary customer details such as your name, mobile number, email address, and shipping address to fulfill orders and provide tracking updates.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                2. Payment Data Security
              </h2>
              <p>
                We do not store or process your credit card numbers, UPI PINs, or banking passwords. All online payments are securely processed through RBI-authorized payment gateways using 256-bit SSL encryption.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                3. Sharing with Logistics Partners
              </h2>
              <p>
                Your delivery address and phone number are shared solely with our authorized courier partners (e.g. Delhivery, India Post) for shipment dispatch, OTP verification, and doorstep delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="font-serif font-bold text-base sm:text-lg text-craft-950">
                4. Contact Us Regarding Your Privacy
              </h2>
              <p>
                If you have questions regarding your personal information, please contact us at <strong>mandaldevanand@gmail.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
