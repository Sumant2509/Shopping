'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Plus, X } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { MatShape } from '@/lib/types';

export default function AdminNewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(449);
  const [mrp, setMrp] = useState<number>(799);
  const [shape, setShape] = useState<MatShape>('flower');
  const [dimensions, setDimensions] = useState('Diameter: 20 inches / 50.8 cm');
  const [thickness, setThickness] = useState('0.6 cm / 6 mm');
  const [material, setMaterial] = useState('Handmade Braided Cotton & Textile Blend');
  const [washability, setWashability] = useState('Hand Washable & Gentle Machine Washable');
  const [craftType, setCraftType] = useState('Handcrafted Braided & Stitched Textile');
  const [stock, setStock] = useState<number>(30);
  const [sku, setSku] = useState(`SKM-${Date.now().toString().slice(-5)}`);
  const [category, setCategory] = useState('Floral Mats');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(true);

  const [colorsInput, setColorsInput] = useState('Marigold & Terracotta, Multi-Color Bloom, Forest Green');
  const [imagesInput, setImagesInput] = useState('/images/hero_doormat.jpg');
  const [featuresInput, setFeaturesInput] = useState('Diameter: 20 inches / 50.8 cm\nThickness: 0.6 cm / 6 mm\nHandmade by skilled artisans\nWashable');

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slug) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const colors = colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const images = imagesInput.split(',').map(img => img.trim()).filter(Boolean);
    const features = featuresInput.split('\n').map(f => f.trim()).filter(Boolean);

    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description,
          price: Number(price),
          mrp: Number(mrp),
          discountPercent,
          shape,
          dimensions,
          thickness,
          material,
          washability,
          craftType,
          colors: colors.length > 0 ? colors : ['Standard'],
          images: images.length > 0 ? images : ['/images/hero_doormat.jpg'],
          stock: Number(stock),
          sku,
          category,
          rating: 5.0,
          reviewCount: 0,
          isBestSeller,
          isNewArrival,
          inStock: Number(stock) > 0,
          tags: [shape, 'handmade', 'doormat', 'washable'],
          features,
        }),
      });

      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-5xl">
        <div className="flex items-center gap-2 text-xs text-craft-500 mb-2">
          <Link href="/admin/products" className="hover:text-terracotta-700 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
          </Link>
        </div>

        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950 mb-6">
          Add New Handcrafted Mat Design
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Flower-Shaped Braided Doormat"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. handmade-flower-doormat"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the weaving technique, floral pattern, material feel, and entrance appeal..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Shape, Dimensions & Material (Strict Specs)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Shape *</label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value as MatShape)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none bg-white font-medium"
                >
                  <option value="flower">Flower Shaped (🌸 Signature)</option>
                  <option value="round">Round Spiral (⭕)</option>
                  <option value="oval">Oval Entryway (🥚)</option>
                  <option value="rectangle">Rectangular (⬛)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Dimensions *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diameter: 20 inches / 50.8 cm"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Thickness *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0.6 cm / 6 mm"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Material *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Handmade Braided Cotton & Textile Blend"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Washability *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hand Washable & Gentle Machine Washable"
                  value={washability}
                  onChange={(e) => setWashability(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Pricing, Inventory & Variants
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-bold text-terracotta-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">MRP Price (₹) *</label>
                <input
                  type="number"
                  required
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Stock Units *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">
                Available Color Variations (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Marigold & Terracotta, Multi-Color Bloom, Natural Jute"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">
                Image URLs (Comma-separated or /images/hero_doormat.jpg)
              </label>
              <input
                type="text"
                value={imagesInput}
                onChange={(e) => setImagesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">
                Key Features (One per line)
              </label>
              <textarea
                rows={3}
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none font-mono text-xs"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-craft-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="rounded text-terracotta-700"
                />
                <span>Mark as Bestseller</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-medium text-craft-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="rounded text-terracotta-700"
                />
                <span>Mark as New Arrival</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href="/admin/products"
              className="px-6 py-3 rounded-full border border-craft-300 text-xs font-semibold text-craft-700 hover:bg-craft-100"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-8 py-3 rounded-full text-xs shadow-warm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Design...' : 'Publish Mat Design'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
