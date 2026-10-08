import React from 'react';
import Link from 'next/link';
import { 
  HeartHandshake, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { generateWhatsAppLink } from '@/lib/utils';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Story Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider bg-terracotta-100 px-3 py-1 rounded-full border border-terracotta-200">
            Our Story & Heritage
          </span>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-craft-950 leading-tight">
            Handcrafted with Devotion in India by Sumant Kumar
          </h1>
          <p className="text-sm sm:text-base text-craft-700 leading-relaxed">
            A small-scale manufacturing workshop bringing authentic handmade textile doormats directly from Indian artisans to your doorstep.
          </p>
        </div>

        {/* Narrative Section with Image */}
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-craft-200 shadow-warm space-y-10 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4 text-craft-700 text-sm sm:text-base leading-relaxed">
              <h2 className="font-serif font-bold text-2xl text-craft-950">
                Direct From the Maker's Loom
              </h2>
              <p>
                Sumant Crafts started with a simple belief: everyday home utility products should be durable, beautifully designed, and reasonably priced.
              </p>
              <p>
                Founded by <strong>Sumant Kumar</strong>, our small manufacturing unit works with local, home-based women weavers and craftspersons. Every single doormat—from our signature 20-inch floral mats to spiral round rugs—is hand-braided, tightly stitched, and finished petal-by-petal.
              </p>
              <p>
                By cutting out distributors, regional middlemen, and high showroom markups, we deliver top-tier handcrafted quality directly to Indian homes at honest, affordable prices.
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-2xl overflow-hidden border-2 border-craft-200 aspect-[4/3] bg-craft-100 shadow-md">
                <img
                  src="/images/hero_doormat.jpg"
                  alt="Handmade textile weaving in Indian workshop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-craft-200">
            <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200">
              <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-800 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-craft-900 text-base mb-1.5">Small-Team Manufacturing</h3>
              <p className="text-xs text-craft-600 leading-relaxed">
                We produce in focused, small batches rather than mass industrial factories, ensuring strict personal quality inspection on every single stitch.
              </p>
            </div>

            <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-craft-900 text-base mb-1.5">Empowering Local Artisans</h3>
              <p className="text-xs text-craft-600 leading-relaxed">
                Providing reliable livelihoods and fair compensation to talented home-based textile weavers and traditional braiders.
              </p>
            </div>

            <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-craft-900 text-base mb-1.5">Honest & Direct Pricing</h3>
              <p className="text-xs text-craft-600 leading-relaxed">
                Factory-to-doorstep direct pricing starting at just ₹349 with zero retail middleman markups.
              </p>
            </div>
          </div>
        </div>

        {/* Workshop Contact Box */}
        <div className="bg-gradient-to-br from-terracotta-900 to-craft-950 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Connect With Owner</span>
            <h3 className="font-serif font-bold text-2xl text-white mt-1">
              Have Questions or Need Custom Bulk Orders?
            </h3>
            <p className="text-xs sm:text-sm text-craft-300 mt-1 max-w-lg">
              Founder Sumant Kumar personally assists with custom dimensions, color choices, and bulk wholesale inquiries.
            </p>
          </div>

          <a
            href={generateWhatsAppLink('918878112007', 'Namaste Sumant ji! I would like to discuss custom or bulk orders.')}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3.5 rounded-full text-xs flex items-center gap-2 transition-colors shadow-lg shrink-0"
          >
            <Phone className="w-4 h-4" />
            <span>Chat on WhatsApp (+91 8878112007)</span>
          </a>
        </div>

      </main>

      <Footer />
    </div>
  );
}
