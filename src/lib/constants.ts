export interface FrameSize {
  id: string;
  name: string;
  width: number;
  height: number;
  basePrice: number;
}

export interface FrameMaterial {
  id: string;
  name: string;
  addedPrice: number;
  color: string; // Hex or CSS color string for rendering
  borderClass: string; // CSS styling for realistic texture rendering
}

export interface GlassType {
  id: string;
  name: string;
  addedPrice: number;
  description: string;
}

export interface BorderOption {
  id: string;
  name: string;
  addedPrice: number;
  color: string;
}

export const FRAME_SIZES: FrameSize[] = [
  { id: '8x12', name: '8 × 12 Inches', width: 8, height: 12, basePrice: 499 },
  { id: '12x18', name: '12 × 18 Inches', width: 12, height: 18, basePrice: 799 },
  { id: '16x24', name: '16 × 24 Inches', width: 16, height: 24, basePrice: 1199 },
  { id: '24x36', name: '24 × 36 Inches', width: 24, height: 36, basePrice: 1999 },
  { id: 'custom', name: 'Custom Size', width: 12, height: 12, basePrice: 0 } // Computed dynamically
];

export const FRAME_MATERIALS: FrameMaterial[] = [
  { id: 'black-wood', name: 'Black Wood', addedPrice: 150, color: '#1a1a1a', borderClass: 'border-neutral-900 bg-stone-900 shadow-stone-950' },
  { id: 'white-wood', name: 'White Wood', addedPrice: 150, color: '#f5f5f0', borderClass: 'border-neutral-100 bg-neutral-50 shadow-neutral-300' },
  { id: 'walnut-wood', name: 'Walnut Wood', addedPrice: 300, color: '#5c4033', borderClass: 'border-amber-950 bg-amber-900 shadow-amber-950' },
  { id: 'premium-metal', name: 'Premium Metal', addedPrice: 500, color: '#d4af37', borderClass: 'border-yellow-700 bg-yellow-600 shadow-yellow-900 metallic' },
  { id: 'canvas-wrap', name: 'Canvas Wrap', addedPrice: 400, color: '#eae5d9', borderClass: 'border-orange-100 bg-orange-50 shadow-orange-200 canvas-edge' }
];

export const GLASS_TYPES: GlassType[] = [
  { id: 'no-glass', name: 'No Glass', addedPrice: 0, description: 'Direct matte surface print' },
  { id: 'standard-glass', name: 'Standard Glass', addedPrice: 100, description: 'Clear float glass protection' },
  { id: 'anti-glare-glass', name: 'Anti-Glare Glass', addedPrice: 250, description: 'Reduces reflections for bright rooms' },
  { id: 'acrylic-protection', name: 'Acrylic Protection', addedPrice: 200, description: 'Shatter-proof premium polymer' }
];

export const BORDER_OPTIONS: BorderOption[] = [
  { id: 'no-border', name: 'No Border', addedPrice: 0, color: 'transparent' },
  { id: 'white-border', name: 'White Border (2")', addedPrice: 50, color: '#ffffff' },
  { id: 'black-border', name: 'Black Border (2")', addedPrice: 50, color: '#000000' },
  { id: 'custom-border', name: 'Custom Border (2")', addedPrice: 100, color: '#cccccc' }
];

// Helper to calculate custom size pricing
export function calculateCustomSizePrice(width: number, height: number): number {
  // Simple pricing based on area
  const areaSqIn = width * height;
  const price = Math.round(areaSqIn * 3.5 + 299); // ₹3.5 per sq inch + ₹299 base
  return price;
}

export interface CustomizationState {
  sizeId: string;
  customWidth: number;
  customHeight: number;
  materialId: string;
  glassTypeId: string;
  borderId: string;
  customBorderColor: string;
  orientation: 'portrait' | 'landscape';
  quantity: number;
}

export function calculateTotalPrice(state: CustomizationState): number {
  let sizeBasePrice = 0;
  if (state.sizeId === 'custom') {
    sizeBasePrice = calculateCustomSizePrice(state.customWidth, state.customHeight);
  } else {
    const size = FRAME_SIZES.find(s => s.id === state.sizeId);
    sizeBasePrice = size ? size.basePrice : 0;
  }

  const material = FRAME_MATERIALS.find(m => m.id === state.materialId);
  const materialPrice = material ? material.addedPrice : 0;

  const glass = GLASS_TYPES.find(g => g.id === state.glassTypeId);
  const glassPrice = glass ? glass.addedPrice : 0;

  const border = BORDER_OPTIONS.find(b => b.id === state.borderId);
  const borderPrice = border ? border.addedPrice : 0;

  const unitPrice = sizeBasePrice + materialPrice + glassPrice + borderPrice;
  return unitPrice * state.quantity;
}
