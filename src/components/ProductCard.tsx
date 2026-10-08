'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Star, ShoppingBag, Eye, Check, Sparkles, MessageSquare } from 'lucide-react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { formatPrice, generateWhatsAppLink } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || 'Natural');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, selectedColor);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, selectedColor);
    router.push('/checkout');
  };

  const whatsAppText = `Namaste Sumant ji! I am interested in buying "${product.name}" (${product.dimensions}) priced at ₹${product.price}. Please share availability.`;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-craft-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-craft-100">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0] || '/images/hero_doormat.jpg'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.isBestSeller && (
            <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Best Seller
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="bg-terracotta-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-craft-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-craft-200 shadow-sm capitalize">
            {product.shape} Mat
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <Link
          href={`/products/${product.slug}`}
          className="absolute inset-x-4 bottom-4 py-2 bg-white/95 backdrop-blur-sm hover:bg-white text-craft-900 rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <Eye className="w-3.5 h-3.5" /> View Details & Specs
        </Link>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Spec pill */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-craft-400 font-normal">({product.reviewCount})</span>
            </div>
            <span className="text-[11px] font-medium text-craft-500 truncate max-w-[130px]">
              {product.dimensions}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block group-hover:text-terracotta-700 transition-colors">
            <h3 className="font-serif font-bold text-craft-900 text-base line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Specs Snippet */}
          <p className="text-xs text-craft-500 mt-1 line-clamp-1">
            {product.material} • Thickness: {product.thickness}
          </p>

          {/* Color Selector Pills */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-craft-400 font-medium">Color:</span>
              {product.colors.slice(0, 3).map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                    selectedColor === col
                      ? 'border-terracotta-600 bg-terracotta-50 text-terracotta-900 font-semibold ring-1 ring-terracotta-500'
                      : 'border-craft-200 text-craft-600 hover:border-craft-400 bg-craft-50'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="mt-4 pt-3 border-t border-craft-100">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-bold text-lg text-craft-900">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <span className="text-xs text-craft-400 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
            <span className="text-[11px] font-bold text-emerald-700 ml-auto">
              Save {formatPrice(product.mrp - product.price)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                added
                  ? 'bg-emerald-700 text-white'
                  : 'bg-craft-100 hover:bg-craft-200 text-craft-900 active:scale-95'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Added
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="py-2 px-3 rounded-xl text-xs font-semibold bg-terracotta-700 hover:bg-terracotta-800 text-white flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              Buy Now
            </button>
          </div>

          {/* Quick WhatsApp Inquiry Link */}
          <div className="mt-2 text-center">
            <a
              href={generateWhatsAppLink('918878112007', whatsAppText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-800 font-medium hover:underline"
            >
              <MessageSquare className="w-3 h-3" /> Order / Inquire on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
