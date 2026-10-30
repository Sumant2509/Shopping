// Utility to generate accurate, realistic vector SVGs of custom flower doormats
// Matches the exact geometry and colors chosen by the user in the 3D Customizer

export const YARN_COLOR_MAP: Record<string, string> = {
  '#0ea5e9': 'Sky Cyan Blue',
  '#ec4899': 'Candy Rose Pink',
  '#f472b6': 'Pastel Lilac Pink',
  '#84cc16': 'Olive Lime Green',
  '#10b981': 'Emerald Green',
  '#eab308': 'Sunshine Gold',
  '#d97706': 'Mustard Ochre',
  '#b91c1c': 'Terracotta Red',
  '#6b21a8': 'Deep Royal Purple',
  '#1d4ed8': 'Cobalt Indigo',
  '#ea580c': 'Sunset Amber',
  '#78350f': 'Rich Cocoa Brown',
  '#fef3c7': 'Ivory Cream',
  '#0d9488': 'Teal Peacock',
  '#1f2937': 'Charcoal Black',
  '#831843': 'Wine Plum',
};

export function getFriendlyColorName(hex: string): string {
  const cleanHex = hex.trim().toLowerCase();
  return YARN_COLOR_MAP[cleanHex] || hex;
}

export function getFriendlyColorSummary(hexList: string[]): string {
  const names = hexList.map(h => getFriendlyColorName(h));
  const uniqueNames = Array.from(new Set(names));
  if (uniqueNames.length === 1) {
    return `Solid ${uniqueNames[0]}`;
  }
  return uniqueNames.join(', ');
}

/**
 * Generates an SVG XML string of the handcrafted scalloped flower doormat
 * with the exact petal count and colors assigned by the customer.
 */
export function generateCustomFlowerSvg(petalCount: number, colors: string[]): string {
  const count = Math.max(3, petalCount);
  const cx = 100;
  const cy = 100;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  let petalPathsSvg = '';

  for (let i = 0; i < count; i++) {
    const startAngle = (i * 360) / count - 90;
    const endAngle = ((i + 1) * 360) / count - 90;
    const midAngle = (startAngle + endAngle) / 2;
    const angleSpan = endAngle - startAngle;

    const t1 = startAngle;
    const t2 = startAngle + angleSpan * 0.22;
    const t3 = startAngle + angleSpan * 0.35;
    const t4 = midAngle;
    const t5 = startAngle + angleSpan * 0.65;
    const t6 = startAngle + angleSpan * 0.78;
    const t7 = endAngle;

    const rBase = 80;
    const rTooth1 = 92;
    const rNotch1 = 86;
    const rApex = 98;
    const rNotch2 = 86;
    const rTooth2 = 92;
    const rInner = 14;

    const p0 = { x: cx + rBase * Math.cos(toRad(t1)), y: cy + rBase * Math.sin(toRad(t1)) };
    const p1 = { x: cx + rTooth1 * Math.cos(toRad(t2)), y: cy + rTooth1 * Math.sin(toRad(t2)) };
    const p2 = { x: cx + rNotch1 * Math.cos(toRad(t3)), y: cy + rNotch1 * Math.sin(toRad(t3)) };
    const p3 = { x: cx + rApex * Math.cos(toRad(t4)), y: cy + rApex * Math.sin(toRad(t4)) };
    const p4 = { x: cx + rNotch2 * Math.cos(toRad(t5)), y: cy + rNotch2 * Math.sin(toRad(t5)) };
    const p5 = { x: cx + rTooth2 * Math.cos(toRad(t6)), y: cy + rTooth2 * Math.sin(toRad(t6)) };
    const p6 = { x: cx + rBase * Math.cos(toRad(t7)), y: cy + rBase * Math.sin(toRad(t7)) };

    const pInStart = { x: cx + rInner * Math.cos(toRad(t1)), y: cy + rInner * Math.sin(toRad(t1)) };
    const pInEnd = { x: cx + rInner * Math.cos(toRad(t7)), y: cy + rInner * Math.sin(toRad(t7)) };

    const d = [
      `M ${pInStart.x.toFixed(1)} ${pInStart.y.toFixed(1)}`,
      `L ${p0.x.toFixed(1)} ${p0.y.toFixed(1)}`,
      `L ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`,
      `L ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`,
      `L ${p3.x.toFixed(1)} ${p3.y.toFixed(1)}`,
      `L ${p4.x.toFixed(1)} ${p4.y.toFixed(1)}`,
      `L ${p5.x.toFixed(1)} ${p5.y.toFixed(1)}`,
      `L ${p6.x.toFixed(1)} ${p6.y.toFixed(1)}`,
      `L ${pInEnd.x.toFixed(1)} ${pInEnd.y.toFixed(1)}`,
      `A ${rInner} ${rInner} 0 0 0 ${pInStart.x.toFixed(1)} ${pInStart.y.toFixed(1)}`,
      'Z',
    ].join(' ');

    const ribRadii = [34, 52, 70];
    const ribArcs = ribRadii.map((r) => {
      const aStart = startAngle + angleSpan * 0.08;
      const aEnd = endAngle - angleSpan * 0.08;
      const ra1 = { x: cx + r * Math.cos(toRad(aStart)), y: cy + r * Math.sin(toRad(aStart)) };
      const ra2 = { x: cx + r * Math.cos(toRad(aEnd)), y: cy + r * Math.sin(toRad(aEnd)) };
      return `M ${ra1.x.toFixed(1)} ${ra1.y.toFixed(1)} A ${r} ${r} 0 0 1 ${ra2.x.toFixed(1)} ${ra2.y.toFixed(1)}`;
    }).join(' ');

    const color = colors[i % colors.length] || '#ec4899';

    petalPathsSvg += `
      <path d="${d}" fill="${color}" stroke="#ffffff" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="${ribArcs}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="0.6" stroke-dasharray="1.5 1.5"/>
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <radialGradient id="hub" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="60%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </radialGradient>
      </defs>
      <g>
        ${petalPathsSvg}
      </g>
      <!-- Central Hub Button -->
      <circle cx="100" cy="100" r="14" fill="url(#hub)" stroke="#ffffff" stroke-width="1.2"/>
      <circle cx="100" cy="100" r="10" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.8" stroke-dasharray="1.5 1.5"/>
      <circle cx="100" cy="100" r="4" fill="#fef3c7" opacity="0.9"/>
    </svg>
  `.trim();
}

/**
 * Returns a high-resolution Vector Data URL of the custom flower doormat
 * to use as `item.image` so Cart, Checkout, Order Review, and Invoices
 * render the 100% exact customer colors!
 */
export function generateCustomFlowerSvgDataUrl(petalCount: number, colors: string[]): string {
  const svg = generateCustomFlowerSvg(petalCount, colors);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Helper to ensure custom doormat items in Cart, Checkout, and Orders
 * always display the exact vector rendering with customer colors,
 * even if stored earlier with placeholder image.
 */
export function getOrderItemDisplayImage(item: { productId: string; image?: string; selectedColor?: string }): string {
  if (item.image && item.image.startsWith('data:image/svg+xml')) {
    return item.image;
  }

  // Detect custom flower mat
  const hexMatches = item.selectedColor ? item.selectedColor.match(/#[0-9a-fA-F]{6}/g) : null;
  if (hexMatches && hexMatches.length > 0) {
    return generateCustomFlowerSvgDataUrl(hexMatches.length, hexMatches);
  }

  return item.image || '/images/hero_doormat.jpg';
}

/**
 * Returns human-readable yarn color names and extracted hex list
 * for clean, beautiful rendering with color swatch dots in Cart & Checkout.
 */
export function getOrderItemColorDisplay(selectedColor?: string): {
  isCustomPalette: boolean;
  hexList: string[];
  displayText: string;
} {
  if (!selectedColor) {
    return { isCustomPalette: false, hexList: [], displayText: 'Standard' };
  }

  const hexMatches = selectedColor.match(/#[0-9a-fA-F]{6}/g);
  if (hexMatches && hexMatches.length > 0) {
    return {
      isCustomPalette: true,
      hexList: hexMatches,
      displayText: getFriendlyColorSummary(hexMatches),
    };
  }

  return {
    isCustomPalette: false,
    hexList: [],
    displayText: selectedColor,
  };
}
