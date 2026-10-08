import React from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  HeartHandshake, 
  Star, 
  HelpCircle, 
  ChevronRight,
  CheckCircle2,
  Phone,
  Layers,
  Palette
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { db } from '@/lib/db';
import { generateWhatsAppLink, formatPrice } from '@/lib/utils';

export default function HomePage() {
  const products = db.getProducts();
  const bestSellers = products.filter(p => p.isBestSeller);
  const newArrivals = products.filter(p => p.isNewArrival);
  const flowerMat = products.find(p => p.shape === 'flower') || products[0];

  const shapes = [
    {
      name: 'Flower Shaped',
      shape: 'flower',
      desc: 'Layered petal designs for entryways & living rooms',
      image: '/images/hero_doormat.jpg',
      badge: 'Bestseller',
    },
    {
      name: 'Round Spiral',
      shape: 'round',
      desc: 'Concentric braided rings for rustic harmony',
      image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80',
      badge: 'Classic',
    },
    {
      name: 'Customize Your Own ✨',
      shape: 'custom',
      desc: 'Pick your shape, dimensions, colors & custom text',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      badge: 'Interactive Builder',
      href: '/customize',
    },
    {
      name: 'Rectangular Doorstep',
      shape: 'rectangle',
      desc: 'Traditional textured handloom weave',
      image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80',
      badge: 'Practical',
    }
  ];

  const colors = [
    { name: 'Marigold & Terracotta', colorClass: 'bg-amber-600', count: '4 Mats' },
    { name: 'Earthy Jute & Cream', colorClass: 'bg-stone-400', count: '5 Mats' },
    { name: 'Forest Green & Ivory', colorClass: 'bg-emerald-800', count: '3 Mats' },
    { name: 'Indigo Sky Blue', colorClass: 'bg-blue-800', count: '3 Mats' },
    { name: 'Lotus Pink & Gold', colorClass: 'bg-pink-600', count: '2 Mats' },
    { name: 'Multicolor Bloom', colorClass: 'bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500', count: '6 Mats' },
  ];

  const faqs = [
    {
      q: 'How do I wash and care for these handmade doormats?',
      a: 'All our cotton braided and crochet doormats are washable! For regular care, simply shake off loose dust. For deeper cleaning, gently hand wash in cold water using a mild detergent and line dry in shade. They retain their shape and vibrant colors without bleeding.',
    },
    {
      q: 'What are the dimensions of the signature Flower-Shaped Mat?',
      a: 'Our signature flower-shaped doormat has a diameter of 20 inches (50.8 cm) with a comfortable thickness of 0.6 cm (6 mm). It fits beautifully in front of standard Indian main doors, pooja rooms, and bedside areas.',
    },
    {
      q: 'How long does delivery take across India?',
      a: 'We ship all orders within 24–48 hours of manufacturing. Metro cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Kolkata, Chennai) typically receive delivery in 3–4 business days. Other cities and towns receive delivery within 4–6 business days via Delhivery Express or India Post.',
    },
    {
      q: 'Can I pay via Cash on Delivery (COD) or UPI?',
      a: 'Yes! We support all Indian payment methods including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).',
    },
    {
      q: 'Can I order custom sizes or colors directly on WhatsApp?',
      a: 'Yes! Since owner Sumant Kumar manufactures each mat directly, you can message us directly on WhatsApp (+91 8878112007) for custom color combinations or bulk requirements.',
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-craft-100/70 via-craft-50 to-white pt-6 pb-16 lg:py-20 border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Content */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta-100 border border-terracotta-200 text-terracotta-900 text-xs font-bold tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-terracotta-700" />
                  <span>DIRECT FROM MAKER • SUMANT KUMAR</span>
                </div>

                <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-craft-950 leading-[1.15] tracking-tight">
                  Beautiful Handmade Doormats for Every Home
                </h1>

                <p className="text-base sm:text-lg text-craft-700 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  Handcrafted with care. Designed for comfort, style and everyday use.
                </p>

                {/* Key Spec Highlights */}
                <div className="grid grid-cols-3 gap-3 pt-2 max-w-md mx-auto lg:mx-0">
                  <div className="bg-white p-3 rounded-xl border border-craft-200 text-center shadow-sm">
                    <p className="text-xs text-craft-500">Craft</p>
                    <p className="text-xs sm:text-sm font-bold text-craft-900 mt-0.5">100% Handmade</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-craft-200 text-center shadow-sm">
                    <p className="text-xs text-craft-500">Care</p>
                    <p className="text-xs sm:text-sm font-bold text-craft-900 mt-0.5">Easy Washable</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-craft-200 text-center shadow-sm">
                    <p className="text-xs text-craft-500">Starting</p>
                    <p className="text-xs sm:text-sm font-bold text-terracotta-700 mt-0.5">₹349 Only</p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link
                    href="/shop"
                    className="w-full sm:w-auto bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-8 py-3.5 rounded-full shadow-warm hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 group text-sm"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/shop?shape=flower"
                    className="w-full sm:w-auto bg-white hover:bg-craft-100 text-craft-900 border border-craft-300 font-semibold px-6 py-3.5 rounded-full transition-all text-sm flex items-center justify-center gap-2"
                  >
                    <span>Explore Flower Mats</span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      Hot
                    </span>
                  </Link>
                </div>

                {/* Trust Markers */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-craft-600">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Free Shipping ₹699+</span>
                  </div>
                  <span className="text-craft-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery</span>
                  </div>
                  <span className="text-craft-300">•</span>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>7-Day Replacement</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Lifestyle Visual */}
              <div className="lg:col-span-6 relative">
                <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-warm-lg aspect-[4/3] sm:aspect-[16/11]">
                  <img
                    src="/images/hero_doormat.jpg"
                    alt="Handmade Flower Shaped Doormat at Indian Home Entrance"
                    className="w-full h-full object-cover object-center transform hover:scale-102 transition-transform duration-700"
                  />
                  {/* Floating Price Pill */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-craft-200 max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-craft-600 uppercase tracking-wider">Top Seller</span>
                    </div>
                    <p className="font-serif font-bold text-craft-900 text-sm mt-0.5">Flower Braided Mat</p>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-bold text-terracotta-800 text-base">{formatPrice(449)}</span>
                      <span className="text-xs text-craft-400 line-through">{formatPrice(799)}</span>
                      <span className="text-[10px] text-emerald-700 font-bold">44% off</span>
                    </div>
                  </div>

                  {/* Craft Badge */}
                  <div className="absolute top-4 right-4 bg-craft-950/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-craft-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>20" Diameter • 6mm Thick</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* BEST SELLERS SECTION */}
        <section className="py-16 bg-white border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
              <div>
                <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">Customer Favorites</span>
                <h2 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
                  Best Selling Handmade Mats
                </h2>
                <p className="text-sm text-craft-600 mt-1">
                  Loved by Indian families for entrance doorways, pooja rooms, and balconies.
                </p>
              </div>
              <Link
                href="/shop"
                className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-terracotta-700 hover:text-terracotta-800 hover:underline"
              >
                <span>View All Products ({products.length})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED SPOTLIGHT: FLOWER SHAPED MAT */}
        <section className="py-16 bg-gradient-to-r from-terracotta-50 via-amber-50/50 to-craft-100 border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-terracotta-200 shadow-warm-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-craft-100 border border-craft-200">
                  <img
                    src="/images/hero_doormat.jpg"
                    alt="Handmade Flower Doormat Signature Edition"
                    className="w-full h-full object-cover object-center"
                  />
                  <span className="absolute top-3 left-3 bg-terracotta-700 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Signature Design
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>STAR PRODUCT • 2,400+ UNITS CRAFTED</span>
                </div>

                <h3 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
                  Handmade Flower-Shaped Braided Doormat
                </h3>

                <p className="text-sm sm:text-base text-craft-700 leading-relaxed">
                  Crafted petal-by-petal using soft braided cotton textile yarn. A radiant floral motif that brings positive traditional vibes and warmth to any Indian doorway.
                </p>

                {/* Exact Verified Specifications Table */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                    <span className="text-[11px] text-craft-500">Diameter</span>
                    <p className="text-xs font-bold text-craft-900 mt-0.5">20 in / 50.8 cm</p>
                  </div>
                  <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                    <span className="text-[11px] text-craft-500">Thickness</span>
                    <p className="text-xs font-bold text-craft-900 mt-0.5">0.6 cm / 6 mm</p>
                  </div>
                  <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                    <span className="text-[11px] text-craft-500">Crafting</span>
                    <p className="text-xs font-bold text-craft-900 mt-0.5">100% Handmade</p>
                  </div>
                  <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                    <span className="text-[11px] text-craft-500">Care</span>
                    <p className="text-xs font-bold text-emerald-800 mt-0.5">Washable</p>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 pt-2">
                  <span className="font-bold text-2xl text-terracotta-800">{formatPrice(449)}</span>
                  <span className="text-sm text-craft-400 line-through">{formatPrice(799)}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Save ₹350 (44% OFF)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Link
                    href={`/products/handmade-flower-doormat`}
                    className="bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-6 py-3 rounded-full text-sm text-center shadow-warm transition-all"
                  >
                    View Product & Order
                  </Link>

                  <a
                    href={generateWhatsAppLink('918878112007', 'Namaste! I want to order the 20-inch Flower Shaped Mat for ₹449.')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-full text-sm text-center flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Order via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SHOP BY SHAPE */}
        <section className="py-16 bg-white border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">Curated Collections</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
                Shop by Mat Shape
              </h2>
              <p className="text-sm text-craft-600 mt-1">
                Choose the perfect geometric silhouette for your door, hallway, balcony, or bedside.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {shapes.map((item) => (
                <Link
                  key={item.shape}
                  href={`/shop?shape=${item.shape}`}
                  className="group bg-craft-50 rounded-2xl p-5 border border-craft-200 hover:border-terracotta-500 hover:bg-white hover:shadow-warm-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-craft-200 mb-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-craft-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-craft-200">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="font-serif font-bold text-lg text-craft-900 group-hover:text-terracotta-700 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-craft-500 mt-1">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-craft-200 flex items-center justify-between text-xs font-bold text-terracotta-700 group-hover:text-terracotta-800">
                    <span>Explore Designs</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* SHOP BY COLOR */}
        <section className="py-14 bg-craft-100/60 border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">Palette Match</span>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-craft-950 mt-0.5">
                  Shop by Colorway
                </h2>
              </div>
              <p className="text-xs text-craft-500">
                Colors tailored for Indian tiles, marble flooring, and hardwood entrances.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
              {colors.map((c) => (
                <Link
                  key={c.name}
                  href={`/shop?color=${encodeURIComponent(c.name)}`}
                  className="bg-white p-3.5 rounded-xl border border-craft-200 hover:border-terracotta-400 hover:shadow-sm transition-all flex items-center gap-3 group"
                >
                  <span className={`w-6 h-6 rounded-full shrink-0 shadow-inner ${c.colorClass}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-craft-900 truncate group-hover:text-terracotta-700 transition-colors">
                      {c.name}
                    </p>
                    <span className="text-[10px] text-craft-500">{c.count}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* NEW ARRIVALS */}
        {newArrivals.length > 0 && (
          <section className="py-16 bg-white border-b border-craft-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                <div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Fresh from Loom</span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
                    New Handcrafted Arrivals
                  </h2>
                  <p className="text-sm text-craft-600 mt-1">
                    Latest artisanal batches freshly braided and ready to ship.
                  </p>
                </div>
                <Link
                  href="/shop?sort=newest"
                  className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-terracotta-700 hover:text-terracotta-800 hover:underline"
                >
                  <span>Explore New Designs</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* WHY CHOOSE US */}
        <section className="py-16 bg-craft-50 border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">Our Promise</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
                Why Buy Directly from Home-Warrior?
              </h2>
              <p className="text-sm text-craft-600 mt-1">
                Honest Indian craftsmanship, direct manufacturing, and customer-first care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-terracotta-100 text-terracotta-800 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-craft-900 text-base mb-2">100% Handmade</h3>
                <p className="text-xs text-craft-600 leading-relaxed">
                  Every mat is carefully braided and stitched by home artisans, giving it exceptional durability and soulful character.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-craft-900 text-base mb-2">Direct from Maker</h3>
                <p className="text-xs text-craft-600 leading-relaxed">
                  Manufactured and shipped directly by Sumant Kumar. No distributors or showroom markups—just fair prices.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-craft-900 text-base mb-2">Easy Wash & Care</h3>
                <p className="text-xs text-craft-600 leading-relaxed">
                  Sturdy cotton textile threads that can be washed gently at home without losing structure or bleeding colors.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-craft-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-craft-900 text-base mb-2">Safe All-India Shipping</h3>
                <p className="text-xs text-craft-600 leading-relaxed">
                  Fast dispatched within 48 hours. Real-time tracking via SMS and WhatsApp with full COD support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOMER REVIEWS */}
        <section className="py-16 bg-white border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
                Loved by 2,000+ Indian Homes
              </h2>
              <p className="text-sm text-craft-600 mt-1">
                Real feedback from verified buyers across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-craft-700 italic leading-relaxed">
                    "The flower shape looks so charming at our main door! Exact 20 inches size as described, neat stitching, and washed it easily by hand without colors bleeding. Supporting handmade Indian artisans feels great."
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-craft-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-craft-900">Ananya Iyer</h4>
                    <span className="text-[11px] text-craft-500">Mumbai, Maharashtra</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>

              <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-craft-700 italic leading-relaxed">
                    "Superb quality direct from maker Sumant Kumar. Reached in 4 days via Delhivery. Looks much more expensive than ₹449. Highly recommended!"
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-craft-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-craft-900">Vikram Sen</h4>
                    <span className="text-[11px] text-craft-500">Kolkata, West Bengal</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>

              <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-craft-700 italic leading-relaxed">
                    "Beautiful braided work, thick and feels comfortable underfoot. Looks great on our balcony entryway."
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-craft-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-craft-900">Meera Nair</h4>
                    <span className="text-[11px] text-craft-500">Kochi, Kerala</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INSTAGRAM & WHATSAPP SHOWCASE */}
        <section className="py-14 bg-craft-100/60 border-b border-craft-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-xl mx-auto mb-6">
              <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">Social Community</span>
              <h2 className="font-serif font-bold text-2xl text-craft-950 mt-1">
                Join the Handcrafted Home Decor Movement
              </h2>
              <p className="text-xs sm:text-sm text-craft-600 mt-1">
                Tag @SumantCrafts on Instagram or send your home setup photo on WhatsApp to get featured!
              </p>
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-3">
              <a
                href={generateWhatsAppLink('918878112007', 'Namaste! Sharing photo of my doormat setup.')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Share Setup on WhatsApp</span>
              </a>
              <Link
                href="/shop"
                className="bg-white hover:bg-craft-200 text-craft-900 border border-craft-300 text-xs font-bold px-6 py-3 rounded-full transition-colors"
              >
                Browse All 6 Styles
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-16 bg-white border-b border-craft-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-terracotta-700 uppercase tracking-wider">Got Questions?</span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mt-1">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details
                  key={idx}
                  className="group bg-craft-50 rounded-2xl border border-craft-200 p-5 transition-colors open:bg-amber-50/40 open:border-amber-200"
                >
                  <summary className="font-serif font-bold text-craft-900 text-sm sm:text-base cursor-pointer flex items-center justify-between list-none">
                    <span>{faq.q}</span>
                    <span className="text-terracotta-700 group-open:rotate-180 transition-transform text-lg ml-2">
                      ▾
                    </span>
                  </summary>
                  <p className="text-xs sm:text-sm text-craft-600 mt-3 pt-3 border-t border-craft-200/60 leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER / WHATSAPP DROP ACCESS */}
        <section className="py-16 bg-gradient-to-br from-terracotta-900 via-terracotta-800 to-craft-950 text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="bg-amber-400 text-craft-950 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Exclusive 10% Off
            </span>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white mt-4">
              Get Notified for New Handmade Mat Drops
            </h2>
            <p className="text-sm text-amber-100 max-w-md mx-auto mt-2 mb-8">
              Use code <strong className="text-amber-300 font-mono">WELCOME10</strong> at checkout to get 10% off your first handcrafted doormat order.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto">
              <Link
                href="/shop"
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-craft-950 font-bold px-8 py-3 rounded-full text-sm transition-colors shadow-lg"
              >
                Shop Now with WELCOME10
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
