'use client';

import React, { useState } from 'react';
import { ZoomIn, Sparkles, CheckCircle } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const activeImage = images[selectedIdx] || '/images/hero_doormat.jpg';

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[500px] shrink-0 pb-2 md:pb-0">
          {images.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedIdx(index)}
              className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-craft-100 ${
                selectedIdx === index
                  ? 'border-terracotta-700 ring-2 ring-terracotta-400 shadow-md'
                  : 'border-craft-200 hover:border-craft-400 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover object-center"
              />
              {index === 0 && (
                <span className="absolute bottom-1 right-1 bg-craft-950/80 text-white text-[8px] font-bold px-1 rounded">
                  Main
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main Image with Zoom */}
      <div
        className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-craft-100 border border-craft-200 shadow-warm cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={activeImage}
          alt={productName}
          className={`w-full h-full object-cover transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                }
              : undefined
          }
        />

        {/* Hover Hint */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-craft-800 text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          <ZoomIn className="w-3.5 h-3.5 text-terracotta-700" />
          <span>Hover to Zoom</span>
        </div>

        {/* Handmade Stamp */}
        <div className="absolute top-4 left-4 bg-terracotta-800/90 backdrop-blur-sm text-amber-200 text-xs font-serif font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Handcrafted in India</span>
        </div>
      </div>
    </div>
  );
}
