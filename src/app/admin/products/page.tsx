'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Sparkles, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.shape.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-craft-100/50">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
              Product Catalog ({products.length})
            </h1>
            <p className="text-xs sm:text-sm text-craft-600 mt-1">
              Manage handcrafted mat designs, prices, stock levels, and specifications.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="bg-terracotta-700 hover:bg-terracotta-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Mat Design</span>
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-craft-200 shadow-sm mb-6 flex items-center gap-2 max-w-md">
          <Search className="w-4 h-4 text-craft-400" />
          <input
            type="text"
            placeholder="Search by mat name, shape, or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs focus:outline-none"
          />
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-3xl border border-craft-200 shadow-warm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-craft-50 border-b border-craft-200 text-craft-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-5">Product</th>
                  <th className="py-3.5 px-5">Shape & Dimensions</th>
                  <th className="py-3.5 px-5">Price (₹)</th>
                  <th className="py-3.5 px-5">Stock</th>
                  <th className="py-3.5 px-5">Colors</th>
                  <th className="py-3.5 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-craft-100 text-craft-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-craft-400">Loading products...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-craft-400">No products found.</td>
                  </tr>
                ) : (
                  filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-craft-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0] || '/images/hero_doormat.jpg'}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-craft-100 shrink-0"
                          />
                          <div>
                            <p className="font-serif font-bold text-craft-950 text-sm line-clamp-1">{product.name}</p>
                            <span className="text-[10px] text-craft-400 font-mono">SKU: {product.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="capitalize font-bold text-craft-900 block">{product.shape}</span>
                        <span className="text-[11px] text-craft-500">{product.dimensions} • {product.thickness}</span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-bold text-craft-950 text-sm">{formatPrice(product.price)}</span>
                        {product.mrp > product.price && (
                          <span className="text-[10px] text-craft-400 line-through block">MRP {formatPrice(product.mrp)}</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          product.stock > 20
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {product.stock} units
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {product.colors.slice(0, 2).map((col) => (
                            <span key={col} className="text-[10px] bg-craft-100 px-1.5 py-0.5 rounded text-craft-700">
                              {col}
                            </span>
                          ))}
                          {product.colors.length > 2 && (
                            <span className="text-[10px] text-craft-400">+{product.colors.length - 2}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/products/${product.slug}`}
                            target="_blank"
                            className="p-1.5 text-craft-400 hover:text-craft-700 rounded-lg"
                            title="View on site"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 text-terracotta-700 hover:text-terracotta-900 rounded-lg hover:bg-terracotta-50"
                            title="Edit product"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-craft-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
