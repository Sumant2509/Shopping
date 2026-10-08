'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle2, Trash2, MessageSquare } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { Review } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.reviews) setReviews(data.reviews);
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
        <div className="mb-8">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-craft-950">
            Customer Reviews ({reviews.length})
          </h1>
          <p className="text-xs sm:text-sm text-craft-600 mt-1">
            Read verified customer feedback and manage customer testimonials.
          </p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 border border-craft-200 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-craft-950">{rev.customerName}</h3>
                  <p className="text-[11px] text-craft-500">{rev.city} • Product: <strong>{rev.productName}</strong></p>
                </div>

                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-craft-700 leading-relaxed bg-craft-50 p-4 rounded-xl border border-craft-100">
                "{rev.comment}"
              </p>

              <div className="flex items-center justify-between text-[11px] text-craft-400 pt-1">
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Published & Verified Buyer
                </span>
                <span>Submitted on {formatDate(rev.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
