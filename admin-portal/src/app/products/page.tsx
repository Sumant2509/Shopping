'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Sparkles,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/AdminLayout';
import { adminApi } from '@/lib/admin-api';
import { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: '',
    shape: 'flower',
    price: 499,
    mrp: 899,
    stock: 50,
    dimensions: 'Diameter: 20 inches / 50.8 cm',
    thickness: '0.6 cm / 6 mm',
    material: 'Pure Hand-Braided Cotton & Textile Blend',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
    description: 'Artisanal hand-braided doormat crafted with traditional Indian weaving techniques.',
  });

  const loadProducts = async () => {
    setLoading(true);
    const data = await adminApi.getProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      shape: 'flower',
      price: 499,
      mrp: 899,
      stock: 50,
      dimensions: 'Diameter: 20 inches / 50.8 cm',
      thickness: '0.6 cm / 6 mm',
      material: 'Pure Hand-Braided Cotton & Textile Blend',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=900&q=80',
      description: 'Artisanal hand-braided doormat crafted with traditional Indian weaving techniques.',
    });
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      shape: p.shape,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      dimensions: p.dimensions,
      thickness: p.thickness,
      material: p.material,
      imageUrl: p.images[0] || '',
      description: p.description,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const discount = Math.round(((form.mrp - form.price) / form.mrp) * 100);

    const productPayload: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description,
      price: Number(form.price),
      mrp: Number(form.mrp),
      discountPercent: discount > 0 ? discount : 0,
      shape: form.shape,
      dimensions: form.dimensions,
      thickness: form.thickness,
      material: form.material,
      washability: 'Hand Washable & Gentle Machine Washable',
      craftType: 'Handmade Braided & Stitched',
      colors: ['Multi-color Bloom', 'Terracotta'],
      images: [form.imageUrl],
      stock: Number(form.stock),
      sku: editingProduct ? editingProduct.sku : `SKM-${form.shape.slice(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
      category: `${form.shape.charAt(0).toUpperCase() + form.shape.slice(1)} Mats`,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 0,
      isBestSeller: true,
      isNewArrival: true,
      inStock: Number(form.stock) > 0,
      tags: [form.shape, 'handmade', 'doormat'],
      features: [form.dimensions, form.thickness, form.material],
      createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
    };

    await adminApi.saveProduct(productPayload);
    setModalOpen(false);
    await loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await adminApi.deleteProduct(id);
      await loadProducts();
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesShape = selectedShape === 'all' || p.shape === selectedShape;
    return matchesSearch && matchesShape;
  });

  return (
    <AdminLayout title="Product Catalog Management">
      {/* Top Header bar with Add Product button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-bold text-craft-900">
            Handmade Doormats ({filtered.length})
          </h2>
          <p className="text-xs text-craft-500">
            Add new designs, update inventory stocks, and set pricing & discounts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-terracotta-600 hover:bg-terracotta-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filters Strip */}
      <div className="bg-white p-4 rounded-2xl border border-craft-200 mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-craft-400" />
          <input
            type="text"
            placeholder="Search by mat name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-craft-200 rounded-xl text-xs text-craft-900 placeholder-craft-400 focus:outline-none focus:ring-2 focus:ring-terracotta-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['all', 'flower', 'starburst', 'round', 'oval', 'rectangle'].map((shape) => (
            <button
              key={shape}
              onClick={() => setSelectedShape(shape)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                selectedShape === shape
                  ? 'bg-terracotta-600 text-white'
                  : 'bg-craft-50 text-craft-700 hover:bg-craft-100'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid / Table */}
      <div className="bg-white rounded-2xl border border-craft-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-craft-50 text-craft-600 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Mat Image & Name</th>
                <th className="px-6 py-3.5">SKU / Shape</th>
                <th className="px-6 py-3.5">Price & MRP</th>
                <th className="px-6 py-3.5">Stock</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-craft-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-craft-50/50 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <img
                      src={prod.images[0] || 'https://via.placeholder.com/80'}
                      alt={prod.name}
                      className="w-12 h-12 rounded-xl object-cover border border-craft-200 shrink-0"
                    />
                    <div>
                      <p className="font-semibold text-craft-900 text-xs">{prod.name}</p>
                      <p className="text-[11px] text-craft-500">{prod.dimensions}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <span className="font-medium text-craft-800">{prod.sku}</span>
                    <span className="block text-[10px] text-craft-400 capitalize">{prod.shape}</span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span className="font-bold text-craft-900">₹{prod.price}</span>
                    <span className="line-through text-craft-400 text-[11px] ml-1.5">₹{prod.mrp}</span>
                    <span className="text-[10px] text-emerald-600 font-bold ml-1">
                      ({prod.discountPercent}% OFF)
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span
                      className={`font-semibold ${
                        prod.stock <= 20 ? 'text-red-600' : 'text-craft-800'
                      }`}
                    >
                      {prod.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        prod.stock > 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {prod.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 text-craft-600 hover:text-terracotta-600 hover:bg-craft-100 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-craft-200 mb-6">
              <h3 className="font-bold text-lg text-craft-900">
                {editingProduct ? 'Edit Product' : 'Add New Handmade Mat'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-craft-400 hover:text-craft-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Handmade Flower-Shaped Braided Doormat"
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Shape Design
                  </label>
                  <select
                    value={form.shape}
                    onChange={(e) => setForm({ ...form, shape: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  >
                    <option value="flower">Flower Shaped</option>
                    <option value="starburst">Starburst Wheel</option>
                    <option value="round">Round Braided</option>
                    <option value="oval">Oval Braided</option>
                    <option value="rectangle">Classic Rectangle</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="e.g. Diameter: 20 inches / 50.8 cm"
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-craft-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-craft-300 rounded-xl text-sm"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-craft-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-craft-300 text-craft-700 rounded-xl text-xs font-medium hover:bg-craft-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-terracotta-600 hover:bg-terracotta-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
