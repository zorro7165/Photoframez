'use client';

import React from 'react';
import {
  FRAME_SIZES,
  FRAME_MATERIALS,
  GLASS_TYPES,
  BORDER_OPTIONS,
  CustomizationState,
  calculateTotalPrice
} from '@/lib/constants';
import { HelpCircle } from 'lucide-react';

interface FrameCustomizerProps {
  state: CustomizationState;
  onChange: (state: CustomizationState) => void;
  onAddToCart: () => void;
}

export default function FrameCustomizer({ state, onChange, onAddToCart }: FrameCustomizerProps) {
  const price = calculateTotalPrice(state);

  const updateField = <K extends keyof CustomizationState>(field: K, value: CustomizationState[K]) => {
    onChange({
      ...state,
      [field]: value
    });
  };

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-colors duration-200">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Configure Your Frame</h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Select material, size, and protection layers.</p>
      </div>

      {/* 1. Orientation */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Orientation
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['portrait', 'landscape'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => updateField('orientation', mode as 'portrait' | 'landscape')}
              className={`py-2 px-4 rounded-lg text-xs font-semibold border capitalize transition-all duration-200
                ${state.orientation === mode
                  ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-500'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:hover:bg-neutral-800/50 dark:text-neutral-300'
                }
              `}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Sizes */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Frame Size
          </label>
          <span className="text-xs text-neutral-400">Inches</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FRAME_SIZES.map((size) => (
            <button
              key={size.id}
              type="button"
              onClick={() => updateField('sizeId', size.id)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200
                ${state.sizeId === size.id
                  ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-500'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:hover:bg-neutral-800/50 dark:text-neutral-300'
                }
              `}
            >
              {size.name}
              {size.id !== 'custom' && (
                <span className="block text-[10px] text-neutral-400 font-normal">
                  ₹{size.basePrice}
                </span>
              )}
              {size.id === 'custom' && (
                <span className="block text-[10px] text-neutral-400 font-normal">
                  Dynamic area rate
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Custom Width/Height inputs */}
        {state.sizeId === 'custom' && (
          <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 dark:bg-neutral-950/30 rounded-xl border border-neutral-100 dark:border-neutral-850 animate-fade-in">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Width (5 - 40&quot;)</label>
              <input
                type="number"
                min={5}
                max={40}
                value={state.customWidth}
                onChange={(e) => updateField('customWidth', Math.min(Math.max(Number(e.target.value), 5), 40))}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md focus:border-amber-600 outline-hidden"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">Height (5 - 40&quot;)</label>
              <input
                type="number"
                min={5}
                max={40}
                value={state.customHeight}
                onChange={(e) => updateField('customHeight', Math.min(Math.max(Number(e.target.value), 5), 40))}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md focus:border-amber-600 outline-hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. Materials */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Frame Material
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FRAME_MATERIALS.map((mat) => (
            <button
              key={mat.id}
              type="button"
              onClick={() => updateField('materialId', mat.id)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all duration-200
                ${state.materialId === mat.id
                  ? 'border-amber-600 bg-amber-50/40 text-amber-900 dark:bg-amber-950/10 dark:text-amber-300'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-850 dark:text-neutral-200'
                }
              `}
            >
              <span
                className="w-6 h-6 rounded-xs border border-black/10 flex-shrink-0 shadow-inner"
                style={{ backgroundColor: mat.color }}
              />
              <div className="flex-1">
                <span className="block text-xs font-semibold">{mat.name}</span>
                <span className="block text-[10px] text-neutral-400 font-normal">
                  +₹{mat.addedPrice}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Glass Type */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
          Glass Type
          <HelpCircle size={12} className="text-neutral-400 cursor-pointer" />
        </label>
        <div className="space-y-2">
          {GLASS_TYPES.map((glass) => (
            <button
              key={glass.id}
              type="button"
              onClick={() => updateField('glassTypeId', glass.id)}
              className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg border text-left text-xs transition-all duration-200
                ${state.glassTypeId === glass.id
                  ? 'border-amber-600 bg-amber-50/30 text-amber-900 dark:bg-amber-950/10 dark:text-amber-300'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:hover:bg-neutral-850 dark:text-neutral-200'
                }
              `}
            >
              <div>
                <span className="font-semibold block">{glass.name}</span>
                <span className="text-[10px] text-neutral-400 font-normal">{glass.description}</span>
              </div>
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                +₹{glass.addedPrice}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Borders / Matting */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Border options (Matting)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {BORDER_OPTIONS.map((border) => (
            <button
              key={border.id}
              type="button"
              onClick={() => updateField('borderId', border.id)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all duration-200
                ${state.borderId === border.id
                  ? 'border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-500'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:hover:bg-neutral-800/50 dark:text-neutral-300'
                }
              `}
            >
              {border.name}
              <span className="block text-[10px] text-neutral-400 font-normal">
                +₹{border.addedPrice}
              </span>
            </button>
          ))}
        </div>

        {/* Custom border color picker */}
        {state.borderId === 'custom-border' && (
          <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-100 dark:border-neutral-850 rounded-xl animate-fade-in">
            <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">Select Border Color:</span>
            <input
              type="color"
              value={state.customBorderColor}
              onChange={(e) => updateField('customBorderColor', e.target.value)}
              className="w-10 h-6 border border-neutral-200 dark:border-neutral-800 rounded-sm cursor-pointer p-0"
            />
            <span className="text-[11px] font-mono text-neutral-400">{state.customBorderColor.toUpperCase()}</span>
          </div>
        )}
      </div>

      {/* 6. Quantity */}
      <div className="flex items-center justify-between border-t border-neutral-150 pt-4 dark:border-neutral-800 mt-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Quantity
        </label>
        <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-950">
          <button
            type="button"
            onClick={() => updateField('quantity', Math.max(state.quantity - 1, 1))}
            className="px-3.5 py-1.5 hover:text-amber-600 text-neutral-600 dark:text-neutral-400"
          >
            -
          </button>
          <span className="px-3 text-sm font-bold text-neutral-800 dark:text-neutral-200">
            {state.quantity}
          </span>
          <button
            type="button"
            onClick={() => updateField('quantity', state.quantity + 1)}
            className="px-3.5 py-1.5 hover:text-amber-600 text-neutral-600 dark:text-neutral-400"
          >
            +
          </button>
        </div>
      </div>

      {/* Pricing and Add to Cart */}
      <div className="border-t border-neutral-150 pt-4 dark:border-neutral-800 flex items-center justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-neutral-400">Total Price</span>
          <span className="text-2xl font-black text-amber-600">
            ₹{price.toLocaleString('en-IN')}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddToCart}
          className="bg-amber-600 text-white font-bold text-sm px-6 py-3 rounded-lg hover:bg-amber-700 shadow-md shadow-amber-600/20 hover:shadow-lg transition-all duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
