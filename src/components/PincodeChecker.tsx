'use client';

import React, { useState } from 'react';
import { MapPin, CheckCircle2, AlertCircle, Truck, Clock } from 'lucide-react';
import { PincodeInfo } from '@/lib/shipping';
import { getEstimatedDeliveryDate } from '@/lib/utils';

export function PincodeChecker() {
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode.trim())) {
      setError('Please enter a valid 6-digit PIN code');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/pincode/${pincode.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Pincode not serviceable');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch {
      setError('Failed to check pincode. Please try again.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-craft-50 p-4 rounded-xl border border-craft-200">
      <div className="flex items-center gap-2 mb-2">
        <MapPin className="w-4 h-4 text-terracotta-700" />
        <h4 className="text-xs font-bold text-craft-900 uppercase tracking-wider">
          Check Delivery & COD Availability
        </h4>
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit PIN code (e.g. 560001, 110001)"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setPincode(val);
            if (error) setError(null);
          }}
          className="flex-1 px-3 py-2 text-xs rounded-lg border border-craft-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500 font-mono tracking-wider"
        />
        <button
          type="submit"
          disabled={loading || pincode.length < 6}
          className="bg-craft-900 hover:bg-craft-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </form>

      {error && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && result.isServiceable && (
        <div className="mt-3 pt-3 border-t border-craft-200 text-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Delivery available to {result.city}, {result.state}!</span>
          </div>
          <div className="flex items-center gap-2 text-craft-600 text-[11px] pl-5">
            <Clock className="w-3 h-3 text-terracotta-600" />
            <span>Estimated Delivery: <strong>{getEstimatedDeliveryDate(result.deliveryDays)}</strong> ({result.deliveryDays} business days)</span>
          </div>
          <div className="flex items-center gap-2 text-craft-600 text-[11px] pl-5">
            <Truck className="w-3 h-3 text-terracotta-600" />
            <span>Cash on Delivery (COD): <strong className="text-emerald-700">Available</strong> • Express Dispatch via {result.courierPartner}</span>
          </div>
        </div>
      )}
    </div>
  );
}
