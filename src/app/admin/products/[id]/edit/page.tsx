'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Product, MatShape } from '@/lib/types';

export default function AdminEditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(449);
  const [mrp, setMrp] = useState<number>(799);
  const [shape, setShape] = useState<MatShape>('flower');
  const [dimensions, setDimensions] = useState('');
  const [thickness, setThickness] = useState('');
  const [material, setMaterial] = useState('');
  const [washability, setWashability] = useState('');
  const [stock, setStock] = useState<number>(30);
  const [sku, setSku] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        if (data.product) {
          const p: Product = data.product;
          setName(p.name);
          setSlug(p.slug);
          setDescription(p.description);
          setPrice(p.price);
          setMrp(p.mrp);
          setShape(p.shape);
          setDimensions(p.dimensions);
          setThickness(p.thickness);
          setMaterial(p.material);
          setWashability(p.washability);
          setStock(p.stock);
          setSku(p.sku);
          setColorsInput(p.colors.join(', '));
          setImagesInput(p.images.join(', '));
          setFeaturesInput(p.features.join('\n'));
          setIsBestSeller(Boolean(p.isBestSeller));
          setIsNewArrival(Boolean(p.isNewArrival));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const colors = colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const images = imagesInput.split(',').map(img => img.trim()).filter(Boolean);
    const features = featuresInput.split('\n').map(f => f.trim()).filter(Boolean);
    const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

    try {
      const res = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          price: Number(price),
          mrp: Number(mrp),
          discountPercent,
          shape,
          dimensions,
          thickness,
          material,
          washability,
          stock: Number(stock),
          sku,
          colors,
          images,
          features,
          isBestSeller,
          isNewArrival,
          inStock: Number(stock) > 0,
        }),
      });

      if (res.ok) {
        router.push('/admin/products');
        router.refresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-craft-100/50">
        <AdminSidebar />
        <main className="flex-1 p-10 text-craft-500">Loading product...</main>
      </div>
    );
  }

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
          Edit Mat: {name}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
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
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Shape & Physical Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Shape</label>
                <select
                  value={shape}
                  onChange={(e) => setShape(e.target.value as MatShape)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-craft-300 bg-white"
                >
                  <option value="flower">Flower Shaped (🌸 Signature)</option>
                  <option value="round">Round Spiral (⭕)</option>
                  <option value="oval">Oval Entryway (🥚)</option>
                  <option value="rectangle">Rectangular (⬛)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Dimensions</label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Thickness</label>
                <input
                  type="text"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Material</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Washability</label>
                <input
                  type="text"
                  value={washability}
                  onChange={(e) => setWashability(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-craft-200 shadow-sm space-y-4">
            <h2 className="font-serif font-bold text-base text-craft-950 pb-2 border-b border-craft-200">
              Pricing & Stock
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Selling Price (₹)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-bold text-terracotta-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">MRP Price (₹)</label>
                <input
                  type="number"
                  value={mrp}
                  onChange={(e) => setMrp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">Stock</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 mb-1">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-craft-700 mb-1">Colors (Comma-separated)</label>
              <input
                type="text"
                value={colorsInput}
                onChange={(e) => setColorsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-craft-300"
              />
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
              disabled={saving}
              className="bg-terracotta-700 hover:bg-terracotta-800 text-white font-bold px-8 py-3 rounded-full text-xs shadow-warm flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
