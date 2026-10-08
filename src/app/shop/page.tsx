'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Search, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { Product, MatShape } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialShape = searchParams.get('shape') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialColor = searchParams.get('color') || 'all';
  const initialSort = searchParams.get('sort') || 'popular';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShape, setSelectedShape] = useState<string>(initialShape);
  const [selectedColor, setSelectedColor] = useState<string>(initialColor);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync URL query params with state
  useEffect(() => {
    const qShape = searchParams.get('shape');
    if (qShape) setSelectedShape(qShape);

    const qSearch = searchParams.get('search');
    if (qSearch) setSearchQuery(qSearch);

    const qColor = searchParams.get('color');
    if (qColor) setSelectedColor(qColor);

    const qSort = searchParams.get('sort');
    if (qSort) setSortBy(qSort);
  }, [searchParams]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Filter & Sort computation
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Shape filter
    if (selectedShape !== 'all') {
      result = result.filter(p => p.shape === selectedShape);
    }

    // Color filter
    if (selectedColor !== 'all') {
      result = result.filter(p => 
        p.colors.some(c => c.toLowerCase().includes(selectedColor.toLowerCase()))
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Price range
    result = result.filter(p => p.price <= priceRange);

    // In-Stock only
    if (inStockOnly) {
      result = result.filter(p => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else {
      // Default: popular / bestsellers first
      result.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
    }

    return result;
  }, [products, selectedShape, selectedColor, searchQuery, priceRange, inStockOnly, sortBy]);

  const resetFilters = () => {
    setSelectedShape('all');
    setSelectedColor('all');
    setSearchQuery('');
    setPriceRange(1000);
    setInStockOnly(false);
    setSortBy('popular');
  };

  const hasActiveFilters = 
    selectedShape !== 'all' || 
    selectedColor !== 'all' || 
    searchQuery.trim() !== '' || 
    priceRange < 1000 || 
    inStockOnly;

  const shapeOptions = [
    { label: 'All Shapes', value: 'all' },
    { label: 'Starburst Wheel ✴️', value: 'starburst' },
    { label: 'Flower Shaped 🌸', value: 'flower' },
    { label: 'Round Spiral ⭕', value: 'round' },
    { label: 'Customize Your Own ✨', value: 'custom' },
    { label: 'Arch & Capsule 🌙', value: 'arch' },
    { label: 'Rectangular ⬛', value: 'rectangle' },
  ];

  const colorOptions = [
    'All Colors',
    'Terracotta',
    'Marigold',
    'Jute',
    'Green',
    'Indigo',
    'Pink',
    'Multicolor'
  ];

  return (
    <div className="min-h-screen flex flex-col bg-craft-50">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Breadcrumb & Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-craft-500 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-terracotta-700 font-semibold">Shop Collection</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
                Handmade Indian Doormats & Floor Mats
              </h1>
              <p className="text-xs sm:text-sm text-craft-600 mt-1">
                Showing {filteredProducts.length} handcrafted designs direct from artisan Sumant Kumar
              </p>
            </div>

            {/* Mobile Filter & Sort Controls */}
            <div className="flex items-center gap-2.5 lg:hidden">
              <button
                onClick={() => setMobileFilterOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-craft-300 text-xs font-semibold text-craft-800 shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4 text-terracotta-700" />
                <span>Filters {hasActiveFilters && '• Active'}</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white px-3 py-2.5 rounded-xl border border-craft-300 text-xs font-semibold text-craft-800 shadow-sm focus:outline-none"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Badges */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
            <span className="text-xs font-bold text-craft-700">Active Filters:</span>
            
            {selectedShape !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-medium text-terracotta-800 border border-craft-200">
                Shape: {selectedShape}
                <button onClick={() => setSelectedShape('all')} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedColor !== 'all' && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-medium text-terracotta-800 border border-craft-200">
                Color: {selectedColor}
                <button onClick={() => setSelectedColor('all')} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-medium text-terracotta-800 border border-craft-200">
                Keyword: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {priceRange < 1000 && (
              <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-full text-xs font-medium text-terracotta-800 border border-craft-200">
                Max: {formatPrice(priceRange)}
                <button onClick={() => setPriceRange(1000)} className="hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={resetFilters}
              className="text-xs font-bold text-terracotta-700 hover:text-terracotta-900 underline ml-auto"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Layout: Sidebar Filters (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-2xl border border-craft-200 shadow-sm self-start">
            <div className="flex items-center justify-between pb-4 border-b border-craft-200">
              <h3 className="font-serif font-bold text-base text-craft-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-terracotta-700" />
                Filter Products
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-terracotta-700 hover:underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Shape Filter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-3">
                Mat Shape
              </h4>
              <div className="space-y-2">
                {shapeOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center justify-between text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      selectedShape === opt.value
                        ? 'bg-terracotta-50 text-terracotta-900 font-bold border border-terracotta-200'
                        : 'text-craft-700 hover:bg-craft-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="shape"
                        checked={selectedShape === opt.value}
                        onChange={() => setSelectedShape(opt.value)}
                        className="text-terracotta-700 focus:ring-terracotta-500"
                      />
                      <span>{opt.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-craft-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-craft-700">
                  Max Price
                </h4>
                <span className="text-xs font-bold text-terracotta-800">
                  {formatPrice(priceRange)}
                </span>
              </div>
              <input
                type="range"
                min={300}
                max={1000}
                step={50}
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-terracotta-700 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-craft-400 mt-1">
                <span>₹300</span>
                <span>₹1,000</span>
              </div>
            </div>

            {/* Color Filter */}
            <div className="pt-4 border-t border-craft-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-2.5">
                Color Tones
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {colorOptions.map((c) => {
                  const val = c === 'All Colors' ? 'all' : c;
                  const isSelected = selectedColor.toLowerCase() === val.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(val)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-terracotta-700 text-white border-terracotta-700 font-semibold'
                          : 'bg-craft-50 text-craft-700 border-craft-200 hover:border-craft-400'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stock Filter */}
            <div className="pt-4 border-t border-craft-200">
              <label className="flex items-center gap-2 text-xs font-medium text-craft-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded text-terracotta-700 focus:ring-terracotta-500"
                />
                <span>In Stock items only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {/* Desktop Sort Header */}
            <div className="hidden lg:flex items-center justify-between bg-white px-5 py-3 rounded-xl border border-craft-200 mb-6 shadow-sm">
              <p className="text-xs text-craft-600 font-medium">
                Showing <strong>{filteredProducts.length}</strong> items
              </p>

              <div className="flex items-center gap-3">
                <span className="text-xs text-craft-500 font-medium">Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-craft-50 border border-craft-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-craft-800 focus:outline-none focus:ring-1 focus:ring-terracotta-500"
                >
                  <option value="popular">Most Popular / Best Sellers</option>
                  <option value="newest">Newest Designs</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-craft-200 animate-pulse space-y-3">
                    <div className="aspect-square bg-craft-200 rounded-xl" />
                    <div className="h-4 bg-craft-200 rounded w-3/4" />
                    <div className="h-3 bg-craft-200 rounded w-1/2" />
                    <div className="h-8 bg-craft-200 rounded" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-craft-200 shadow-sm space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-craft-900 text-lg">No mats found matching filters</h3>
                <p className="text-xs text-craft-500 max-w-sm mx-auto">
                  Try clearing your search query or reset the shape/color filters to see all available handcrafted designs.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-terracotta-700 hover:bg-terracotta-800 text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden animate-fadeIn">
          <div
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-craft-950/60 backdrop-blur-sm"
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-sm bg-white shadow-xl flex flex-col">
              <div className="p-4 border-b border-craft-200 flex items-center justify-between bg-craft-50">
                <h3 className="font-serif font-bold text-base text-craft-900">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg text-craft-500 hover:text-craft-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Shape Filter */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-2">
                    Shape
                  </h4>
                  <div className="space-y-1.5">
                    {shapeOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-2 p-2.5 rounded-lg text-xs ${
                          selectedShape === opt.value
                            ? 'bg-terracotta-50 text-terracotta-900 font-bold border border-terracotta-200'
                            : 'text-craft-700 hover:bg-craft-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mobile-shape"
                          checked={selectedShape === opt.value}
                          onChange={() => setSelectedShape(opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-craft-200">
                  <div className="flex justify-between text-xs font-bold text-craft-700 mb-2">
                    <span>Max Price</span>
                    <span className="text-terracotta-800">{formatPrice(priceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min={300}
                    max={1000}
                    step={50}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-terracotta-700"
                  />
                </div>

                {/* Color */}
                <div className="pt-4 border-t border-craft-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-craft-700 mb-2">
                    Color
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {colorOptions.map((c) => {
                      const val = c === 'All Colors' ? 'all' : c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedColor(val)}
                          className={`text-xs px-2.5 py-1 rounded-full border ${
                            selectedColor.toLowerCase() === val.toLowerCase()
                              ? 'bg-terracotta-700 text-white border-terracotta-700'
                              : 'bg-craft-50 text-craft-700 border-craft-200'
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-craft-200 bg-craft-50 flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 py-2.5 rounded-xl border border-craft-300 text-xs font-semibold text-craft-800"
                >
                  Reset
                </button>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-terracotta-700 text-white text-xs font-bold shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-craft-50">
        <Header />
        <div className="flex-1 max-w-7xl mx-auto px-4 py-16 text-center text-craft-500">
          Loading Shop Collection...
        </div>
        <Footer />
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
