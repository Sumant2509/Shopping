'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  ShoppingBag, 
  Check, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  RotateCcw, 
  Phone, 
  Plus, 
  Minus, 
  Layers, 
  Droplet,
  Heart,
  Share2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ImageGallery } from '@/components/ImageGallery';
import { PincodeChecker } from '@/components/PincodeChecker';
import { ProductCard } from '@/components/ProductCard';
import { Product, Review } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { formatPrice, generateWhatsAppLink, formatDate } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [addedToast, setAddedToast] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review form state
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCity, setReviewerCity] = useState('');
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${params.slug}`);
        const data = await res.json();

        if (data.product) {
          setProduct(data.product);
          setSelectedColor(data.product.colors[0] || 'Standard');

          // Fetch related
          const allRes = await fetch('/api/products');
          const allData = await allRes.json();
          if (allData.products) {
            const rel = allData.products
              .filter((p: Product) => p.id !== data.product.id)
              .slice(0, 3);
            setRelated(rel);
          }

          // Fetch reviews
          const revRes = await fetch(`/api/reviews?productId=${data.product.id}`);
          const revData = await revRes.json();
          if (revData.reviews) {
            setReviews(revData.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-craft-50">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 w-full animate-pulse space-y-8">
          <div className="h-6 bg-craft-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-square bg-craft-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-8 bg-craft-200 rounded w-3/4" />
              <div className="h-6 bg-craft-200 rounded w-1/3" />
              <div className="h-24 bg-craft-200 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-craft-50">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-serif font-bold text-2xl text-craft-900 mb-2">Product Not Found</h2>
          <p className="text-sm text-craft-600 mb-6">The handcrafted mat you are looking for may have been moved or updated.</p>
          <Link
            href="/shop"
            className="bg-terracotta-700 text-white font-bold px-6 py-2.5 rounded-full text-xs"
          >
            Explore Catalog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity, selectedColor);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedColor);
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          customerName: reviewerName,
          city: reviewerCity || 'India',
          rating: reviewerRating,
          comment: reviewerComment,
        }),
      });

      const data = await res.json();
      if (data.success && data.review) {
        setReviews(prev => [data.review, ...prev]);
        setReviewSuccess(true);
        setReviewerName('');
        setReviewerCity('');
        setReviewerComment('');
      }
    } catch (e) {
      console.error('Failed to submit review', e);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const whatsAppText = `Namaste Sumant ji! I want to order the "${product.name}" in "${selectedColor}" color (${product.dimensions}) - Quantity: ${quantity} for ₹${product.price * quantity}. Please let me know how to proceed.`;

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "sku": product.sku,
    "brand": {
      "@type": "Brand",
      "name": "Home-Warrior"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://sumanthandmade.in/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Person",
        "name": "Sumant Kumar"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount || 1
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-craft-500 mb-6">
          <Link href="/" className="hover:text-terracotta-700">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-terracotta-700">Shop</Link>
          <span>/</span>
          <span className="text-terracotta-800 font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-craft-200 shadow-warm mb-16">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6">
            <ImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-6 space-y-6">
            {/* Top Badges & Share */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-terracotta-100 text-terracotta-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.shape} Shaped
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock ({product.stock} units)
                </span>
              </div>

              <button
                onClick={handleShare}
                className="text-craft-500 hover:text-craft-900 p-2 rounded-full hover:bg-craft-100 transition-colors relative"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
                {copiedLink && (
                  <span className="absolute -top-7 right-0 bg-craft-900 text-white text-[10px] py-0.5 px-2 rounded whitespace-nowrap shadow">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>

            {/* Title & Rating */}
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-craft-300">•</span>
                <a href="#reviews" className="text-xs text-craft-600 hover:text-terracotta-700 underline font-medium">
                  {product.reviewCount} Verified Customer Reviews
                </a>
                <span className="text-craft-300">•</span>
                <span className="text-xs text-craft-500 font-mono">SKU: {product.sku}</span>
              </div>
            </div>

            {/* Price & Savings */}
            <div className="bg-craft-50 p-4 rounded-2xl border border-craft-200">
              <div className="flex items-baseline gap-3">
                <span className="font-bold text-3xl text-terracotta-800">
                  {formatPrice(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm text-craft-400 line-through">
                    MRP {formatPrice(product.mrp)}
                  </span>
                )}
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full ml-auto">
                  Save {formatPrice(product.mrp - product.price)} ({product.discountPercent}% OFF)
                </span>
              </div>
              <p className="text-[11px] text-craft-500 mt-1">
                Inclusive of all taxes • Free delivery on orders above ₹699
              </p>
            </div>

            {/* Verified Specifications Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-3">
                Craft & Sizing Specifications
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                  <span className="text-craft-500 block text-[11px]">Exact Dimensions</span>
                  <strong className="text-craft-900">{product.dimensions}</strong>
                </div>

                <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                  <span className="text-craft-500 block text-[11px]">Thickness</span>
                  <strong className="text-craft-900">{product.thickness}</strong>
                </div>

                <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                  <span className="text-craft-500 block text-[11px]">Material</span>
                  <strong className="text-craft-900">{product.material}</strong>
                </div>

                <div className="p-3 bg-craft-50 rounded-xl border border-craft-200">
                  <span className="text-craft-500 block text-[11px]">Washability</span>
                  <strong className="text-emerald-800">{product.washability}</strong>
                </div>
              </div>
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-craft-700 block mb-2">
                  Select Color: <span className="text-terracotta-800 font-semibold">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all ${
                        selectedColor === col
                          ? 'border-terracotta-700 bg-terracotta-50 text-terracotta-900 font-bold ring-2 ring-terracotta-400'
                          : 'border-craft-200 bg-craft-50 text-craft-700 hover:border-craft-400'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-craft-700 block mb-2">
                Quantity
              </label>
              <div className="inline-flex items-center border border-craft-300 rounded-xl bg-craft-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-craft-200 rounded-l-xl text-craft-700"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold text-craft-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2.5 hover:bg-craft-200 rounded-r-xl text-craft-700"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="py-3.5 px-6 rounded-full font-bold text-sm bg-craft-900 hover:bg-craft-800 text-white flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{addedToast ? 'Added to Cart ✓' : 'Add to Cart'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="py-3.5 px-6 rounded-full font-bold text-sm bg-terracotta-700 hover:bg-terracotta-800 text-white flex items-center justify-center gap-2 shadow-warm active:scale-[0.99] transition-all"
                >
                  <span>Buy Now (₹{product.price * quantity})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp Direct Order Button */}
              <a
                href={generateWhatsAppLink('918878112007', whatsAppText)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-full font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Order this item directly on WhatsApp (+91 8878112007)</span>
              </a>
            </div>

            {/* Pincode Delivery Estimator */}
            <PincodeChecker />

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-craft-600">
              <div className="p-2 bg-craft-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-terracotta-700 mx-auto mb-1" />
                <span>100% Handcrafted</span>
              </div>
              <div className="p-2 bg-craft-50 rounded-lg">
                <Truck className="w-4 h-4 text-terracotta-700 mx-auto mb-1" />
                <span>Direct Maker Dispatch</span>
              </div>
              <div className="p-2 bg-craft-50 rounded-lg">
                <RotateCcw className="w-4 h-4 text-terracotta-700 mx-auto mb-1" />
                <span>7-Day Replacement</span>
              </div>
            </div>

          </div>
        </div>

        {/* Detailed Product Description & Care Guide */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-craft-200 shadow-warm mb-16 space-y-8">
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-craft-950 mb-3">
              Product Overview & Craft Details
            </h2>
            <p className="text-sm sm:text-base text-craft-700 leading-relaxed max-w-3xl">
              {product.description}
            </p>
          </div>

          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-craft-900 mb-3">
              Confirmed Features & Specifications
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-craft-700">
              {product.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200/60">
            <h4 className="font-serif font-bold text-amber-900 text-sm mb-1">
              Washing & Maintenance Instructions
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              This handcrafted textile doormat is designed for easy washability. Shake well to dust off loose dirt. When soiled, hand wash in cold water using gentle liquid soap. Lay flat or hang in shade to air dry. Do not bleach or tumble dry on high heat.
            </p>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews" className="bg-white rounded-3xl p-6 sm:p-10 border border-craft-200 shadow-warm mb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-craft-200">
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-craft-950">
                Customer Ratings & Reviews
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-bold text-craft-900">{product.rating} out of 5</span>
                <span className="text-xs text-craft-500">({reviews.length} reviews)</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 mb-10">
            {reviews.length === 0 ? (
              <p className="text-xs text-craft-500 italic">No reviews yet. Be the first to share your experience!</p>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-craft-50 p-5 rounded-2xl border border-craft-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-terracotta-700 text-white font-bold text-xs flex items-center justify-center">
                        {rev.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-craft-900">{rev.customerName}</h4>
                        <p className="text-[10px] text-craft-500">{rev.city}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-craft-700 leading-relaxed mt-2">
                    "{rev.comment}"
                  </p>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-craft-400">
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                    </span>
                    <span>{formatDate(rev.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <div className="bg-craft-50 p-6 rounded-2xl border border-craft-200">
            <h3 className="font-serif font-bold text-base text-craft-900 mb-3">
              Write a Review
            </h3>

            {reviewSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                Thank you! Your verified review has been published.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-craft-300 focus:outline-none focus:ring-1 focus:ring-terracotta-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-craft-700 mb-1">City, State</label>
                    <input
                      type="text"
                      placeholder="e.g. Pune, Maharashtra"
                      value={reviewerCity}
                      onChange={(e) => setReviewerCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-craft-300 focus:outline-none focus:ring-1 focus:ring-terracotta-500 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Rating</label>
                  <select
                    value={reviewerRating}
                    onChange={(e) => setReviewerRating(Number(e.target.value))}
                    className="px-3 py-2 text-xs rounded-lg border border-craft-300 focus:outline-none bg-white"
                  >
                    <option value={5}>5 Stars - Excellent Craftsmanship</option>
                    <option value={4}>4 Stars - Very Good Quality</option>
                    <option value={3}>3 Stars - Average</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe how the mat looks at your entrance, stitching quality, texture, washability..."
                    value={reviewerComment}
                    onChange={(e) => setReviewerComment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-craft-300 focus:outline-none focus:ring-1 focus:ring-terracotta-500 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="bg-terracotta-700 hover:bg-terracotta-800 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-colors"
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Customer Review'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mb-16">
            <div className="mb-6">
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-craft-950">
                You May Also Like
              </h2>
              <p className="text-xs text-craft-600">Other handcrafted shapes from our workshop</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((relProd) => (
                <ProductCard key={relProd.id} product={relProd} />
              ))}
            </div>
          </section>
        )}

        {/* Mobile Sticky Buy Now / Add to Cart Bar */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-3 border-t border-craft-200 shadow-2xl z-30 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] text-craft-500 truncate block">{product.name}</span>
            <span className="font-bold text-sm text-terracotta-800">{formatPrice(product.price * quantity)}</span>
          </div>

          <button
            onClick={handleAddToCart}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-craft-100 text-craft-900"
          >
            {addedToast ? 'Added ✓' : 'Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-terracotta-700 text-white shadow-warm"
          >
            Buy Now
          </button>
        </div>

      </main>

      <Footer />
    </div>
  );
}
