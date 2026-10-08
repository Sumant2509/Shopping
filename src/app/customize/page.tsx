'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useCart } from '@/lib/cart-context';
import {
  Sparkles,
  ShoppingBag,
  Palette,
  Maximize2,
  RefreshCw,
  Check,
  Layers,
  ShieldCheck,
  Droplets,
  Wind,
  Home,
  Footprints,
  Eye,
  Sliders,
  Info,
  CheckCircle2,
  Heart,
  Share2
} from 'lucide-react';

// Radial petal count options
const PETAL_COUNT_OPTIONS = [
  { count: 2, label: '2 Petals (Dual Split)', desc: 'Half & half 2-color split (Photo 4 Style)', badge: 'Dual Tone' },
  { count: 4, label: '4 Petals (Quad Bloom)', desc: 'Balanced 4-quarter floral motif', badge: 'Classic' },
  { count: 5, label: '5 Petals (5-Star Pent)', desc: 'Signature 5-petal star bloom (Photo 3 Style)', badge: 'Popular' },
  { count: 6, label: '6 Petals (Flower Hex)', desc: 'Vibrant 6-slice braided mat (Photo 2 Style)', badge: 'Best Seller' },
  { count: 8, label: '8 Petals (Octa Star)', desc: 'Symmetrical 8-point blossom', badge: 'Mandala' },
  { count: 10, label: '10 Petals (Deca Star)', desc: 'Dense 10-petal radial weave', badge: 'Intricate' },
  { count: 12, label: '12 Petals (Sunburst)', desc: '12-pointed radial sunburst flower', badge: 'Classic' },
  { count: 16, label: '16 Petals (Fiesta Bloom)', desc: 'Ultra-dense multi-color burst (Photo 1 Style)', badge: 'Masterpiece' },
];

// Rich Yarn Color Swatches
const YARN_SWATCHES = [
  { name: 'Sky Cyan Blue', hex: '#0ea5e9', group: 'Cool', desc: 'Vibrant sea breeze cyan' },
  { name: 'Candy Rose Pink', hex: '#ec4899', group: 'Warm', desc: 'Bright blossom pink' },
  { name: 'Pastel Lilac Pink', hex: '#f472b6', group: 'Pastel', desc: 'Soft pastel blossom' },
  { name: 'Olive Lime Green', hex: '#84cc16', group: 'Natural', desc: 'Fresh botanical lime' },
  { name: 'Emerald Green', hex: '#10b981', group: 'Natural', desc: 'Lush jewel emerald' },
  { name: 'Sunshine Gold', hex: '#eab308', group: 'Warm', desc: 'Bright radiant marigold' },
  { name: 'Mustard Ochre', hex: '#d97706', group: 'Earthy', desc: 'Warm traditional ochre' },
  { name: 'Terracotta Red', hex: '#b91c1c', group: 'Earthy', desc: 'Rustic clay terracotta' },
  { name: 'Deep Royal Purple', hex: '#6b21a8', group: 'Royal', desc: 'Regal velvet violet' },
  { name: 'Cobalt Indigo', hex: '#1d4ed8', group: 'Royal', desc: 'Deep ocean cobalt' },
  { name: 'Sunset Amber', hex: '#ea580c', group: 'Warm', desc: 'Glowing sunset orange' },
  { name: 'Rich Cocoa Brown', hex: '#78350f', group: 'Earthy', desc: 'Earthy braided bark' },
  { name: 'Ivory Cream', hex: '#fef3c7', group: 'Neutral', desc: 'Clean natural cotton' },
  { name: 'Teal Peacock', hex: '#0d9488', group: 'Cool', desc: 'Rich peacock lagoon' },
  { name: 'Charcoal Black', hex: '#1f2937', group: 'Neutral', desc: 'Deep slate outline' },
  { name: 'Wine Plum', hex: '#831843', group: 'Royal', desc: 'Luxurious velvet plum' },
];

// Photo-accurate Presets matching the user's uploaded images
const PHOTO_PRESETS = [
  {
    id: 'photo-3-pastel',
    name: '🌸 5-Petal Pastel Bloom (Photo 3)',
    desc: 'Sky blue, pastel pink, olive lime, warm yellow & regal purple',
    count: 5,
    palette: ['#0ea5e9', '#f472b6', '#84cc16', '#eab308', '#6b21a8'],
  },
  {
    id: 'photo-2-rainbow',
    name: '🎨 6-Petal Multicolor Braid (Photo 2)',
    desc: 'Royal purple, sunshine gold, cobalt blue, terracotta red, lime & candy pink',
    count: 6,
    palette: ['#6b21a8', '#eab308', '#1d4ed8', '#b91c1c', '#84cc16', '#ec4899'],
  },
  {
    id: 'photo-4-dual',
    name: '🌊 Dual-Tone Wave (Photo 4)',
    desc: 'Sunshine gold & sky cyan half-and-half contrast',
    count: 2,
    palette: ['#eab308', '#0ea5e9'],
  },
  {
    id: 'photo-1-fiesta',
    name: '🌟 16-Petal Fiesta Burst (Photo 1)',
    desc: 'Multi-hue festive gradient with pinks, greens, ochres & terracotta',
    count: 16,
    palette: [
      '#ec4899', '#84cc16', '#b91c1c', '#d97706', '#78350f', '#ec4899', '#10b981', '#6b21a8',
      '#ea580c', '#0ea5e9', '#fef3c7', '#b91c1c', '#eab308', '#84cc16', '#831843', '#0d9488'
    ],
  },
  {
    id: 'preset-sunset',
    name: '🌅 Sunset Terracotta & Ochre',
    desc: 'Warm terracotta, ochre, ivory cream & cocoa',
    count: 6,
    palette: ['#b91c1c', '#ea580c', '#d97706', '#fef3c7', '#78350f', '#eab308'],
  },
  {
    id: 'preset-peacock',
    name: '🦚 Royal Peacock & Emerald',
    desc: 'Deep indigo, peacock teal, emerald & gold',
    count: 6,
    palette: ['#1d4ed8', '#0d9488', '#10b981', '#eab308', '#6b21a8', '#0ea5e9'],
  }
];

// Mat Size Options
const SIZE_PRESETS = [
  { diameter: 18, label: '18" Compact', cm: '45.7 cm', priceMod: 0.9, useCase: 'Bedside & Bathroom' },
  { diameter: 20, label: '20" Signature Standard (Photo Size)', cm: '50.0 cm', priceMod: 1.0, isPopular: true, useCase: 'Main Entrance & Doorway' },
  { diameter: 22, label: '22" Medium Starburst', cm: '55.8 cm', priceMod: 1.15, useCase: 'Living Foyer & Kitchen' },
  { diameter: 24, label: '24" Large Bloom', cm: '61.0 cm', priceMod: 1.35, useCase: 'Pooja Room & Balcony' },
  { diameter: 28, label: '28" Grand Entryway', cm: '71.1 cm', priceMod: 1.75, useCase: 'Grand Entrance & Lounge' },
];

export default function CustomizePage() {
  const { addItem, setIsCartDrawerOpen } = useCart();

  // 1. Radial Petals State
  const [petalCount, setPetalCount] = useState<number>(6);
  const [pointColors, setPointColors] = useState<string[]>(() => PHOTO_PRESETS[1].palette);
  const [activePetalIndex, setActivePetalIndex] = useState<number>(0);
  const [isSingleColorMode, setIsSingleColorMode] = useState(false);

  // 2. View Mode & Display
  const [previewMode, setPreviewMode] = useState<'studio' | 'marble' | 'wood'>('marble');
  const [showTexture, setShowTexture] = useState(true);
  const [showRibs, setShowRibs] = useState(true);

  // 3. Size & Details
  const [selectedSize, setSelectedSize] = useState(SIZE_PRESETS[1]); // 20" Signature Standard
  const [thickness, setThickness] = useState('0.6 cm / 6mm - 10mm (High-Density Braided Cushion)');
  const [customText, setCustomText] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Synchronize colors when petal count changes
  const handlePetalCountChange = (count: number) => {
    setPetalCount(count);
    const newColors = Array.from({ length: count }, (_, i) => pointColors[i % pointColors.length] || YARN_SWATCHES[i % YARN_SWATCHES.length].hex);
    setPointColors(newColors);
    if (activePetalIndex >= count) {
      setActivePetalIndex(0);
    }
  };

  // Set color for active petal OR all petals if single color mode
  const handleSetColorForActivePetal = (colorHex: string) => {
    if (isSingleColorMode) {
      setPointColors(Array.from({ length: petalCount }, () => colorHex));
    } else {
      const updated = [...pointColors];
      updated[activePetalIndex] = colorHex;
      setPointColors(updated);
    }
  };

  // Apply photo preset
  const handleApplyPreset = (preset: typeof PHOTO_PRESETS[0]) => {
    setPetalCount(preset.count);
    setPointColors([...preset.palette]);
    setActivePetalIndex(0);
  };

  // Randomize colors
  const handleRandomize = () => {
    const shuffled = Array.from({ length: petalCount }, () => {
      const randIdx = Math.floor(Math.random() * YARN_SWATCHES.length);
      return YARN_SWATCHES[randIdx].hex;
    });
    setPointColors(shuffled);
  };

  // Price Calculation
  const basePrice = 449;
  const computedPrice = Math.round(basePrice * selectedSize.priceMod + (customText.trim() ? 99 : 0));
  const computedMrp = Math.round(computedPrice * 1.65);
  const savings = computedMrp - computedPrice;

  // Add to Cart handler
  const handleAddToCart = () => {
    const uniqueColorNames = Array.from(
      new Set(pointColors.map((hex) => YARN_SWATCHES.find((s) => s.hex === hex)?.name || hex))
    );

    const customItem = {
      id: `custom-flower-${Date.now()}`,
      name: `Custom ${petalCount}-Petal Handcrafted Flower Doormat (${selectedSize.diameter}")`,
      slug: 'custom-handcrafted-flower-doormat',
      description: `Handcrafted ${petalCount}-petal scalloped flower doormat custom braided with pure cotton textile yarn in ${uniqueColorNames.join(', ')}. Features anti-slip backing, washable fabric, and high-density cushioning.`,
      price: computedPrice,
      mrp: computedMrp,
      discountPercent: Math.round(((computedMrp - computedPrice) / computedMrp) * 100),
      shape: 'flower' as const,
      dimensions: `Diameter: ${selectedSize.diameter} inches / ${selectedSize.cm}`,
      thickness: thickness,
      material: '100% Pure Braided Cotton Yarn with Anti-Slip Base',
      washability: 'Hand Washable & Gentle Machine Washable',
      craftType: `Handmade ${petalCount}-Petal Scalloped Flower Braid`,
      colors: pointColors,
      images: ['/images/starburst_doormat.png'],
      stock: 99,
      sku: `SKM-FLW-${petalCount}P-${selectedSize.diameter}`,
      category: 'Custom Flower Doormats',
      rating: 5.0,
      reviewCount: 1,
      inStock: true,
      tags: ['custom', 'flower', 'petal', `${petalCount}-petals`, 'scalloped', 'braided', 'handmade', 'non-slip'],
      features: [
        `Petal Structure: ${petalCount} Scalloped Flower Petals`,
        `Size: ${selectedSize.diameter}" Diameter (${selectedSize.cm})`,
        `Cushion Thickness: ${thickness}`,
        `Anti-Slip Grip Base: Yes, Non-Skid Backing`,
        `Yarn Colors (${uniqueColorNames.length}): ${uniqueColorNames.join(', ')}`,
        customText ? `Custom Inscribed Tag: "${customText}"` : 'Handcrafted without tag',
      ],
      createdAt: new Date().toISOString(),
    };

    addItem(customItem, 1, pointColors.join(','));
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3000);
    setIsCartDrawerOpen(true);
  };

  // SVG Geometry Calculation for realistic scalloped flower petals with multi-tooth jagged tips
  const petalPaths = useMemo(() => {
    const paths: { pathData: string; ribArcs: string[]; angleCenter: number; color: string; index: number }[] = [];
    const cx = 100;
    const cy = 100;

    for (let i = 0; i < petalCount; i++) {
      const startAngle = (i * 360) / petalCount - 90;
      const endAngle = ((i + 1) * 360) / petalCount - 90;
      const midAngle = (startAngle + endAngle) / 2;
      const angleSpan = endAngle - startAngle;

      const toRad = (deg: number) => (deg * Math.PI) / 180;

      // Realistic jagged scalloped petal outer contour
      // Subdivide petal perimeter into 3 scalloped teeth as seen in the photos
      const t1 = startAngle;
      const t2 = startAngle + angleSpan * 0.22;
      const t3 = startAngle + angleSpan * 0.35;
      const t4 = midAngle; // Apex center tip
      const t5 = startAngle + angleSpan * 0.65;
      const t6 = startAngle + angleSpan * 0.78;
      const t7 = endAngle;

      const rBase = 80;
      const rTooth1 = 92;
      const rNotch1 = 86;
      const rApex = 98; // Highest point of petal
      const rNotch2 = 86;
      const rTooth2 = 92;

      const p0 = { x: cx + rBase * Math.cos(toRad(t1)), y: cy + rBase * Math.sin(toRad(t1)) };
      const p1 = { x: cx + rTooth1 * Math.cos(toRad(t2)), y: cy + rTooth1 * Math.sin(toRad(t2)) };
      const p2 = { x: cx + rNotch1 * Math.cos(toRad(t3)), y: cy + rNotch1 * Math.sin(toRad(t3)) };
      const p3 = { x: cx + rApex * Math.cos(toRad(t4)), y: cy + rApex * Math.sin(toRad(t4)) };
      const p4 = { x: cx + rNotch2 * Math.cos(toRad(t5)), y: cy + rNotch2 * Math.sin(toRad(t5)) };
      const p5 = { x: cx + rTooth2 * Math.cos(toRad(t6)), y: cy + rTooth2 * Math.sin(toRad(t6)) };
      const p6 = { x: cx + rBase * Math.cos(toRad(t7)), y: cy + rBase * Math.sin(toRad(t7)) };

      // Inner center hub radius
      const rInner = 14;
      const pInStart = { x: cx + rInner * Math.cos(toRad(t1)), y: cy + rInner * Math.sin(toRad(t1)) };
      const pInEnd = { x: cx + rInner * Math.cos(toRad(t7)), y: cy + rInner * Math.sin(toRad(t7)) };

      // Complete Petal Contour Path
      const pathData = `
        M ${pInStart.x} ${pInStart.y}
        L ${p0.x} ${p0.y}
        L ${p1.x} ${p1.y}
        L ${p2.x} ${p2.y}
        L ${p3.x} ${p3.y}
        L ${p4.x} ${p4.y}
        L ${p5.x} ${p5.y}
        L ${p6.x} ${p6.y}
        L ${pInEnd.x} ${pInEnd.y}
        A ${rInner} ${rInner} 0 0 0 ${pInStart.x} ${pInStart.y}
        Z
      `;

      // Rib knit crochet curved stitch lines
      const ribRadii = [34, 52, 70];
      const ribArcs = ribRadii.map((r) => {
        const aStart = startAngle + angleSpan * 0.08;
        const aEnd = endAngle - angleSpan * 0.08;
        const ra1 = { x: cx + r * Math.cos(toRad(aStart)), y: cy + r * Math.sin(toRad(aStart)) };
        const ra2 = { x: cx + r * Math.cos(toRad(aEnd)), y: cy + r * Math.sin(toRad(aEnd)) };
        return `M ${ra1.x} ${ra1.y} A ${r} ${r} 0 0 1 ${ra2.x} ${ra2.y}`;
      });

      paths.push({
        pathData,
        ribArcs,
        angleCenter: midAngle,
        color: pointColors[i % pointColors.length] || '#ec4899',
        index: i,
      });
    }

    return paths;
  }, [petalCount, pointColors]);

  return (
    <div className="min-h-screen bg-craft-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Top Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-terracotta-100 text-terracotta-900 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 shadow-xs border border-amber-200">
            <Sparkles className="w-4 h-4 text-terracotta-600 animate-pulse" />
            <span>Sumant Handcrafts 3D Studio</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-5xl text-craft-950 tracking-tight">
            Design Your Custom Flower Petal Doormat
          </h1>
          <p className="mt-3 text-sm sm:text-base text-craft-600">
            Handcrafted with 100% braided cotton yarn. Pick your petal count (2 to 16 petals), choose vibrant yarn colors, and preview on marble floors in real time!
          </p>
        </div>

        {/* 2-Column Customizer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Interactive Realistic Flower Doormat Canvas */}
          <div className="lg:col-span-6 bg-white p-5 sm:p-7 rounded-3xl border border-craft-200 shadow-lg sticky top-24">
            
            {/* View Mode Bar */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-craft-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-craft-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-terracotta-600" /> Preview Floor:
                </span>
                <div className="flex bg-craft-100 p-0.5 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('marble')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      previewMode === 'marble' ? 'bg-white text-terracotta-900 shadow-xs font-bold' : 'text-craft-600'
                    }`}
                  >
                    🏛️ Marble Tile
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('wood')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      previewMode === 'wood' ? 'bg-white text-terracotta-900 shadow-xs font-bold' : 'text-craft-600'
                    }`}
                  >
                    🪵 Hardwood
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('studio')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      previewMode === 'studio' ? 'bg-white text-terracotta-900 shadow-xs font-bold' : 'text-craft-600'
                    }`}
                  >
                    ✨ Studio
                  </button>
                </div>
              </div>

              <span className="text-xs font-mono bg-terracotta-100 text-terracotta-900 px-3 py-1 rounded-full font-bold">
                {petalCount} Petals • {selectedSize.diameter}" ({selectedSize.cm})
              </span>
            </div>

            {/* Interactive SVG Canvas Container with Realistic Floor Textures */}
            <div
              className={`relative aspect-square w-full rounded-2xl border-2 border-craft-200 flex items-center justify-center p-6 sm:p-8 overflow-hidden transition-all duration-500 shadow-inner ${
                previewMode === 'marble'
                  ? 'bg-gradient-to-b from-[#f3ede4] via-[#e9dfd1] to-[#ded2c1] ring-1 ring-amber-900/10'
                  : previewMode === 'wood'
                  ? 'bg-gradient-to-br from-[#8d5b38] via-[#744525] to-[#593318] ring-1 ring-amber-950/30'
                  : 'bg-gradient-to-br from-amber-50/90 via-orange-50/30 to-amber-100/60'
              }`}
            >
              
              {/* Marble Tile Lines Overlay */}
              {previewMode === 'marble' && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="w-full h-full grid grid-cols-2 grid-rows-2 border border-amber-800/20">
                    <div className="border-r border-b border-amber-800/15" />
                    <div className="border-b border-amber-800/15" />
                    <div className="border-r border-amber-800/15" />
                    <div />
                  </div>
                  {/* Soft entrance doorway lighting gradient */}
                  <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-amber-900/15 to-transparent" />
                </div>
              )}

              {/* Hardwood Planks Overlay */}
              {previewMode === 'wood' && (
                <div className="absolute inset-0 pointer-events-none opacity-25">
                  <div className="w-full h-full flex flex-col justify-between">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-full border-b border-amber-950/40 h-8" />
                    ))}
                  </div>
                </div>
              )}

              {/* Realistic Drop Shadow under Mat */}
              <div className="relative w-full h-full flex items-center justify-center">
                
                {/* Floor Shadow */}
                <div className="absolute inset-4 rounded-full bg-black/35 blur-xl transform scale-95 translate-y-3 pointer-events-none" />

                {/* Main Interactive Flower SVG */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full relative z-10 transition-transform duration-300 filter drop-shadow-2xl"
                >
                  <defs>
                    {/* Braided Yarn Knit Texture Pattern */}
                    <pattern id="knitTexture" width="4" height="4" patternUnits="userSpaceOnUse">
                      <path d="M0 2 Q 2 0 4 2 Q 2 4 0 2" fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="0.75" />
                      <path d="M2 0 Q 4 2 2 4 Q 0 2 2 0" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
                    </pattern>

                    {/* Central Button Gradient */}
                    <radialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="60%" stopColor="#d97706" />
                      <stop offset="100%" stopColor="#78350f" />
                    </radialGradient>

                    {/* Subtle 3D Petal Bevel Filter */}
                    <filter id="petalDepth" x="-10%" y="-10%" width="120%" height="120%">
                      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.25" />
                    </filter>
                  </defs>

                  {/* Render Flower Petals */}
                  <g filter="url(#petalDepth)">
                    {petalPaths.map((petal) => {
                      const isSelected = activePetalIndex === petal.index;

                      return (
                        <g
                          key={petal.index}
                          onClick={() => setActivePetalIndex(petal.index)}
                          className="cursor-pointer transition-transform duration-200 group"
                        >
                          {/* Main Petal Body with Scalloped Outer Teeth */}
                          <path
                            d={petal.pathData}
                            fill={petal.color}
                            stroke={isSelected ? '#ffffff' : 'rgba(0,0,0,0.18)'}
                            strokeWidth={isSelected ? '2.5' : '1'}
                            className="transition-all duration-200 hover:brightness-110"
                          />

                          {/* Knitted Texture Overlay */}
                          {showTexture && (
                            <path
                              d={petal.pathData}
                              fill="url(#knitTexture)"
                              pointerEvents="none"
                              opacity="0.85"
                            />
                          )}

                          {/* Arched Rib Knit Stitch Lines (Signature Crochet Detail from Photos) */}
                          {showRibs && (
                            <g pointerEvents="none" opacity="0.65">
                              {petal.ribArcs.map((arc, aIdx) => (
                                <path
                                  key={aIdx}
                                  d={arc}
                                  fill="none"
                                  stroke="rgba(255,255,255,0.45)"
                                  strokeWidth="1.2"
                                  strokeDasharray="2.5, 2.5"
                                />
                              ))}
                            </g>
                          )}

                          {/* Petal Selection Indicator Ring */}
                          {isSelected && (
                            <circle
                              cx={100 + 64 * Math.cos(((petal.angleCenter) * Math.PI) / 180)}
                              cy={100 + 64 * Math.sin(((petal.angleCenter) * Math.PI) / 180)}
                              r="6.5"
                              fill="#ffffff"
                              stroke="#0f172a"
                              strokeWidth="2"
                              className="animate-bounce"
                            />
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* Central Handcrafted Hub / Braid Center (Signature Knot) */}
                  <g>
                    <circle cx="100" cy="100" r="14" fill="url(#centerHubGrad)" stroke="#451a03" strokeWidth="1.5" />
                    <circle cx="100" cy="100" r="9" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" strokeDasharray="2, 2" />
                    <circle cx="100" cy="100" r="4.5" fill="#fef3c7" />
                  </g>
                </svg>

                {/* Custom Embossed Text Banner in Center */}
                {customText.trim() && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <span className="bg-craft-950/85 text-amber-200 font-serif font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md border border-amber-300/50 shadow-2xl">
                      {customText}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Quick Canvas View Controls */}
            <div className="flex items-center justify-between mt-3 text-xs text-craft-600 px-1">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showTexture}
                    onChange={(e) => setShowTexture(e.target.checked)}
                    className="rounded text-terracotta-600 focus:ring-terracotta-500 w-3.5 h-3.5"
                  />
                  <span>Braided Texture</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showRibs}
                    onChange={(e) => setShowRibs(e.target.checked)}
                    className="rounded text-terracotta-600 focus:ring-terracotta-500 w-3.5 h-3.5"
                  />
                  <span>Crochet Rib Stitch</span>
                </label>
              </div>

              <span className="text-[11px] font-medium text-craft-500">
                💡 Tip: Click any petal to change its color!
              </span>
            </div>

            {/* Active Petal Status Banner */}
            <div className="mt-4 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs font-bold text-craft-900">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-terracotta-700 text-white flex items-center justify-center text-[10px] shadow-xs">
                  {activePetalIndex + 1}
                </span>
                <span>Active Petal #{activePetalIndex + 1} of {petalCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-craft-500 font-normal">Yarn Color:</span>
                <span
                  className="w-4 h-4 rounded-full border border-black/20 shadow-xs"
                  style={{ backgroundColor: pointColors[activePetalIndex] }}
                />
                <span className="font-mono text-craft-900">
                  {YARN_SWATCHES.find((s) => s.hex === pointColors[activePetalIndex])?.name || pointColors[activePetalIndex]}
                </span>
              </div>
            </div>

            {/* Spec Highlights Grid (Directly inspired by user's Photo 4) */}
            <div className="mt-6 pt-5 border-t border-craft-200">
              <span className="text-xs font-bold text-craft-900 uppercase tracking-wider block mb-3">
                Crafted Spec Features (Photo 4 Spec):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 bg-craft-50 rounded-xl border border-craft-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold text-craft-800">Non-Slip Grip Base</span>
                </div>
                <div className="p-2.5 bg-craft-50 rounded-xl border border-craft-200 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
                  <span className="text-[11px] font-bold text-craft-800">100% Washable</span>
                </div>
                <div className="p-2.5 bg-craft-50 rounded-xl border border-craft-200 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-[11px] font-bold text-craft-800">Quick Dry Braid</span>
                </div>
                <div className="p-2.5 bg-craft-50 rounded-xl border border-craft-200 flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="text-[11px] font-bold text-craft-800">Soft 0.6cm Cushion</span>
                </div>
                <div className="p-2.5 bg-craft-50 rounded-xl border border-craft-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-terracotta-600 shrink-0" />
                  <span className="text-[11px] font-bold text-craft-800">Flower Petal Shape</span>
                </div>
                <div className="p-2.5 bg-craft-50 rounded-xl border border-craft-200 flex items-center gap-2">
                  <Home className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="text-[11px] font-bold text-craft-800">Entrance & Kitchen</span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Customizer Controls & Selections */}
          <div className="lg:col-span-6 space-y-6">

            {/* STEP 1: PHOTO PRESET PALETTES (Matches Photos 1, 2, 3, 4) */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-craft-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-craft-100">
                <label className="text-xs font-bold text-craft-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-terracotta-700" /> 1. Photo-Accurate Presets
                </label>
                <span className="text-[11px] text-terracotta-700 font-bold">1-Click Apply</span>
              </div>

              <p className="text-xs text-craft-600">
                Quickly select the exact handcrafted styles shown in our product photography:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PHOTO_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="p-3.5 rounded-2xl border border-craft-200 hover:border-terracotta-500 text-left bg-craft-50/70 hover:bg-amber-50/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="font-bold text-xs text-craft-950 block group-hover:text-terracotta-800">
                        {preset.name}
                      </span>
                      <span className="text-[11px] text-craft-500 block mt-1 line-clamp-2">
                        {preset.desc}
                      </span>
                    </div>

                    {/* Color Swatch Dots Bar */}
                    <div className="flex items-center gap-1.5 mt-3">
                      {preset.palette.map((hex, pIdx) => (
                        <span
                          key={pIdx}
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-2xs shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 2: SELECT PETAL SEGMENTS COUNT */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-craft-200 shadow-sm space-y-3">
              <label className="text-xs font-bold text-craft-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-craft-100">
                <Layers className="w-4 h-4 text-terracotta-700" /> 2. Choose Number of Flower Petals
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PETAL_COUNT_OPTIONS.map((opt) => (
                  <button
                    key={opt.count}
                    type="button"
                    onClick={() => handlePetalCountChange(opt.count)}
                    className={`p-3 rounded-2xl border text-left transition-all relative ${
                      petalCount === opt.count
                        ? 'border-terracotta-600 bg-amber-50/90 ring-2 ring-terracotta-500/30 shadow-sm'
                        : 'border-craft-200 hover:border-craft-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-craft-950">{opt.count} Petals</span>
                      {petalCount === opt.count && <Check className="w-3.5 h-3.5 text-terracotta-700" />}
                    </div>
                    <span className="text-[10px] text-craft-500 block mt-0.5 truncate">{opt.desc}</span>
                    {opt.badge && (
                      <span className="inline-block mt-1.5 px-1.5 py-0.5 bg-craft-200/80 text-craft-800 rounded text-[9px] font-bold uppercase tracking-wider">
                        {opt.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 3: ASSIGN YARN COLORS PER PETAL */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-craft-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-craft-100">
                <label className="text-xs font-bold text-craft-900 uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4 text-terracotta-700" /> 3. Assign Yarn Color Per Petal
                </label>
                <button
                  type="button"
                  onClick={handleRandomize}
                  className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Randomize
                </button>
              </div>

              {/* Color Mode Switcher */}
              <div className="flex rounded-2xl bg-craft-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsSingleColorMode(false)}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    !isSingleColorMode ? 'bg-white text-terracotta-800 shadow-xs font-bold' : 'text-craft-600 hover:text-craft-900'
                  }`}
                >
                  Multi-Color Petals (Custom per Petal)
                </button>
                <button
                  type="button"
                  onClick={() => setIsSingleColorMode(true)}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    isSingleColorMode ? 'bg-white text-terracotta-800 shadow-xs font-bold' : 'text-craft-600 hover:text-craft-900'
                  }`}
                >
                  Solid 1 Color (Entire Mat)
                </button>
              </div>

              {!isSingleColorMode ? (
                /* Petal Pills Selector */
                <div>
                  <span className="text-xs font-bold text-craft-700 block mb-2">
                    Click a Petal to Edit Its Color:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {Array.from({ length: petalCount }).map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePetalIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                          activePetalIndex === idx
                            ? 'border-terracotta-700 bg-terracotta-700 text-white shadow-md'
                            : 'border-craft-200 bg-white text-craft-800 hover:border-craft-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20"
                          style={{ backgroundColor: pointColors[idx] }}
                        />
                        <span>Petal #{idx + 1}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
                  <span>Single Color Mode: Choose any yarn swatch below to apply to all {petalCount} petals.</span>
                </div>
              )}

              {/* Yarn Color Swatches Grid */}
              <div className="pt-2">
                <span className="text-xs font-bold text-craft-900 block mb-2">
                  Select Yarn Color for Petal #{activePetalIndex + 1}:
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {YARN_SWATCHES.map((swatch) => {
                    const isCurrentColor = pointColors[activePetalIndex] === swatch.hex;
                    return (
                      <button
                        key={swatch.hex}
                        type="button"
                        onClick={() => handleSetColorForActivePetal(swatch.hex)}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                          isCurrentColor
                            ? 'border-terracotta-600 bg-amber-100/90 ring-2 ring-terracotta-500/30'
                            : 'border-craft-200 hover:border-craft-300 bg-white'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <span className="text-[11px] text-craft-900 truncate">{swatch.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* STEP 4: CHOOSE DIAMETER & SIZE */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-craft-200 shadow-sm space-y-4">
              <label className="text-xs font-bold text-craft-900 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-craft-100">
                <Maximize2 className="w-4 h-4 text-terracotta-700" /> 4. Select Diameter Size
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SIZE_PRESETS.map((sz) => (
                  <button
                    key={sz.diameter}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`p-3.5 rounded-2xl border text-left transition-all ${
                      selectedSize.diameter === sz.diameter
                        ? 'border-terracotta-600 bg-amber-50/90 ring-2 ring-terracotta-500/30 shadow-sm'
                        : 'border-craft-200 hover:border-craft-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-craft-950">{sz.label}</span>
                      {selectedSize.diameter === sz.diameter && <Check className="w-3.5 h-3.5 text-terracotta-700" />}
                    </div>
                    <span className="text-xs text-terracotta-700 font-mono font-bold block mt-0.5">{sz.cm}</span>
                    <span className="text-[10px] text-craft-500 block mt-1">Best for: {sz.useCase}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STEP 5: OPTIONAL CUSTOM INSCRIBED TAG */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-craft-200 shadow-sm space-y-3">
              <label className="text-xs font-bold text-craft-900 uppercase tracking-wider flex items-center justify-between pb-2 border-b border-craft-100">
                <span>5. Optional Custom Inscription Tag (+₹99)</span>
                <span className="text-[10px] text-craft-500 lowercase font-normal">e.g. WELCOME, HOME, SWEET HOME</span>
              </label>

              <input
                type="text"
                maxLength={20}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Enter custom word / initials (Optional)"
                className="w-full px-4 py-2.5 rounded-xl border border-craft-300 focus:outline-hidden focus:ring-2 focus:ring-terracotta-500 text-xs font-medium text-craft-900"
              />
            </div>

            {/* Sticky/Bottom Checkout & Cart Box */}
            <div className="bg-gradient-to-r from-craft-900 via-craft-950 to-craft-900 p-6 sm:p-8 rounded-3xl text-white shadow-2xl space-y-4 border border-craft-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-amber-300 uppercase font-bold tracking-wider block">
                    Custom Craft Price Quote
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-1">
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-white">
                      ₹{computedPrice}
                    </span>
                    <span className="text-sm text-craft-400 line-through">
                      ₹{computedMrp}
                    </span>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      Save ₹{savings} (38% OFF)
                    </span>
                  </div>
                  <span className="text-[11px] text-craft-400 block mt-1">
                    Includes GST, Free Pan-India Delivery & Cash on Delivery Available
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-gradient-to-r from-terracotta-600 via-amber-600 to-terracotta-600 hover:from-terracotta-700 hover:to-amber-700 text-white font-bold px-8 py-4 rounded-2xl text-sm shadow-warm flex items-center justify-center gap-2.5 transition-all shrink-0 active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>{addedSuccess ? '✓ Added to Cart!' : 'Add Custom Mat to Cart'}</span>
                </button>
              </div>

              {/* Quality Guarantee Note */}
              <div className="pt-3 border-t border-craft-800/80 flex items-center justify-between text-[11px] text-craft-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Hand-braided to your exact color order
                </span>
                <span>Dispatch in 2-3 Business Days</span>
              </div>
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
