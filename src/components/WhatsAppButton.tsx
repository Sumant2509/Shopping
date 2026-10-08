'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { generateWhatsAppLink } from '@/lib/utils';

export function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const phone = '918878112007';
  const defaultText = 'Namaste Sumant ji! I am browsing your handmade doormat store and would like some assistance.';

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Tooltip Popup */}
      {showTooltip && (
        <div className="mb-3 bg-white p-3.5 rounded-2xl shadow-warm-lg border border-craft-200 max-w-xs animate-fadeIn relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute top-2 right-2 text-craft-400 hover:text-craft-700"
            aria-label="Close message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <p className="text-xs font-bold text-craft-900">Chat with Sumant Kumar</p>
          </div>
          <p className="text-xs text-craft-600 leading-relaxed">
            Need custom sizes or bulk orders? Tap to chat directly on WhatsApp!
          </p>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={generateWhatsAppLink(phone, defaultText)}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-warm-lg hover:scale-105 active:scale-95 transition-all group relative border-2 border-white"
        aria-label="Contact on WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white" />
      </a>
    </div>
  );
}
