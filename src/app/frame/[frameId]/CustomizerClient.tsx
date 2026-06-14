'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { calculateTotalPrice, CustomizationState, FRAME_MATERIALS, FRAME_SIZES } from '@/lib/constants';
import FramePreview from '@/components/FramePreview';
import RoomMockup from '@/components/RoomMockup';
import FrameCustomizer from '@/components/FrameCustomizer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Maximize2, Sparkles, Check, ShoppingBag, Eye } from 'lucide-react';
import Link from 'next/link';

interface CustomizerClientProps {
  image: {
    frameId: string;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
  };
}

export default function CustomizerClient({ image }: CustomizerClientProps) {
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<'preview' | 'room'>('preview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddedAlert, setShowAddedAlert] = useState(false);

  // Initialize customization options state
  const [customConfig, setCustomConfig] = useState<CustomizationState>({
    sizeId: '12x18',
    customWidth: 12,
    customHeight: 12,
    materialId: 'walnut-wood',
    glassTypeId: 'anti-glare-glass',
    borderId: 'white-border',
    customBorderColor: '#ffffff',
    orientation: 'portrait',
    quantity: 1
  });

  const currentPrice = calculateTotalPrice(customConfig);

  const handleAddToCart = () => {
    addToCart({
      frameId: image.frameId,
      title: image.title,
      imageUrl: image.imageUrl,
      sizeId: customConfig.sizeId,
      customWidth: customConfig.sizeId === 'custom' ? customConfig.customWidth : undefined,
      customHeight: customConfig.sizeId === 'custom' ? customConfig.customHeight : undefined,
      materialId: customConfig.materialId,
      glassTypeId: customConfig.glassTypeId,
      borderId: customConfig.borderId,
      customBorderColor: customConfig.customBorderColor,
      orientation: customConfig.orientation,
      quantity: customConfig.quantity,
      price: calculateTotalPrice({ ...customConfig, quantity: 1 }) // unit price
    });

    // Show celebratory success toast
    setShowAddedAlert(true);
    setTimeout(() => {
      setShowAddedAlert(false);
    }, 4500);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Success Alert Toast */}
        {showAddedAlert && (
          <div className="fixed top-20 right-4 z-50 max-w-md bg-white dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-xl p-4 shadow-2xl animate-slide-in">
            <div className="flex gap-3">
              <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600">
                <Check size={20} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">Added to Cart!</h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  &quot;{image.title}&quot; has been added with your selected frame configs.
                </p>
                <div className="flex gap-2 mt-3">
                  <Link
                    href="/checkout"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-xs font-semibold shadow-xs"
                  >
                    Checkout Now
                  </Link>
                  <button
                    onClick={() => setShowAddedAlert(false)}
                    className="px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:hover:bg-neutral-800 rounded-md text-xs font-semibold"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Route Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
              Customizer Portal • {image.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-outfit text-neutral-900 dark:text-white mt-1">
              {image.title}
            </h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Frame ID: {image.frameId}</p>
          </div>
        </div>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Visualizers (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* View Mode Toggle TABS */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setViewMode('preview')}
                className={`py-3 px-6 font-semibold text-sm border-b-2 -mb-[2px] transition-colors
                  ${viewMode === 'preview'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                  }
                `}
              >
                Frame Preview (2D)
              </button>
              <button
                onClick={() => setViewMode('room')}
                className={`py-3 px-6 font-semibold text-sm border-b-2 -mb-[2px] transition-colors
                  ${viewMode === 'room'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                  }
                `}
              >
                Wall Visualization (3D)
              </button>
            </div>

            {/* Visualizer Display Screen */}
            <div className="relative bg-neutral-100 dark:bg-neutral-900/30 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center p-6 shadow-sm">
              {viewMode === 'preview' ? (
                <div className="w-full h-full flex items-center justify-center relative">
                  <FramePreview
                    imageUrl={image.imageUrl}
                    materialId={customConfig.materialId}
                    borderId={customConfig.borderId}
                    customBorderColor={customConfig.customBorderColor}
                    orientation={customConfig.orientation}
                    glassTypeId={customConfig.glassTypeId}
                  />

                  {/* Actions layer */}
                  <div className="absolute bottom-4 right-4 flex gap-2">
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="p-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 rounded-full shadow-lg transition-all"
                      title="Fullscreen Preview"
                    >
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <RoomMockup
                    imageUrl={image.imageUrl}
                    materialId={customConfig.materialId}
                    borderId={customConfig.borderId}
                    customBorderColor={customConfig.customBorderColor}
                    orientation={customConfig.orientation}
                    glassTypeId={customConfig.glassTypeId}
                    sizeId={customConfig.sizeId}
                    customWidth={customConfig.customWidth}
                    customHeight={customConfig.customHeight}
                  />
                </div>
              )}
            </div>

            {/* Description Card */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-5 rounded-xl">
              <h3 className="font-bold text-xs uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                Product Details
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed mt-2">
                {image.description}
              </p>
              <div className="flex gap-2 mt-4">
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500 font-semibold uppercase">
                  HD Giclée Print
                </span>
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500 font-semibold uppercase">
                  Premium {customConfig.materialId.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Customizer Controls (5 cols) */}
          <div className="lg:col-span-5">
            <FrameCustomizer
              state={customConfig}
              onChange={setCustomConfig}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </main>

      <Footer />

      {/* Fullscreen Overlay Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 z-55">
            <button
              onClick={() => setIsFullscreen(false)}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-full transition-all"
            >
              ✕ Close
            </button>
          </div>

          {/* Image Container */}
          <div className="relative w-full max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden">
            {/* Renders the full 2D Frame representation in high detail */}
            <FramePreview
              imageUrl={image.imageUrl}
              materialId={customConfig.materialId}
              borderId={customConfig.borderId}
              customBorderColor={customConfig.customBorderColor}
              orientation={customConfig.orientation}
              glassTypeId={customConfig.glassTypeId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
