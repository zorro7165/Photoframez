'use client';

import React from 'react';
import { FRAME_MATERIALS, BORDER_OPTIONS } from '@/lib/constants';

interface FramePreviewProps {
  imageUrl: string;
  materialId: string;
  borderId: string;
  customBorderColor: string;
  orientation: 'portrait' | 'landscape';
  glassTypeId: string;
}

export default function FramePreview({
  imageUrl,
  materialId,
  borderId,
  customBorderColor,
  orientation,
  glassTypeId
}: FramePreviewProps) {
  // Find material specs
  const material = FRAME_MATERIALS.find(m => m.id === materialId) || FRAME_MATERIALS[0];
  const borderOpt = BORDER_OPTIONS.find(b => b.id === borderId) || BORDER_OPTIONS[0];

  // Matting color
  let mattingColor = '#ffffff';
  if (borderOpt.id === 'black-border') mattingColor = '#171717';
  else if (borderOpt.id === 'custom-border') mattingColor = customBorderColor;

  const hasMatting = borderOpt.id !== 'no-border';

  // Realistic border texture styles
  const getMaterialStyle = () => {
    switch (materialId) {
      case 'walnut-wood':
        return {
          backgroundColor: '#5c4033',
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 10px), repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 15px)',
          borderWidth: '16px',
          borderColor: '#422f25',
          boxShadow: 'inset 0 0 12px rgba(0,0,0,0.8), 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        };
      case 'black-wood':
        return {
          backgroundColor: '#171717',
          backgroundImage: 'linear-gradient(45deg, #111111 25%, transparent 25%), linear-gradient(-45deg, #111111 25%, transparent 25%)',
          backgroundSize: '4px 4px',
          borderWidth: '16px',
          borderColor: '#0f0f0f',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.9), 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        };
      case 'white-wood':
        return {
          backgroundColor: '#f5f5f0',
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.01) 0px, rgba(0,0,0,0.01) 1px, transparent 1px, transparent 8px)',
          borderWidth: '16px',
          borderColor: '#e1e1d8',
          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        };
      case 'premium-metal':
        return {
          background: 'linear-gradient(135deg, #bf953f 0%, #fcf6ba 25%, #b38728 50%, #fbf5b7 75%, #aa771c 100%)',
          borderWidth: '8px',
          borderColor: '#8a640f',
          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4), 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.25)',
        };
      case 'canvas-wrap':
      default:
        // Canvas wrap is borderless and extends around the edges
        return {
          borderWidth: '0px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), inset 0 0 100px rgba(0,0,0,0.1)',
          background: '#eae5d9',
        };
    }
  };

  const frameStyle = getMaterialStyle();

  return (
    <div className="flex items-center justify-center p-4 w-full h-full min-h-[300px]">
      <div
        style={frameStyle}
        className={`relative transition-all duration-300 ease-out overflow-hidden flex items-center justify-center
          ${orientation === 'landscape' ? 'w-full max-w-[480px] aspect-[3/2]' : 'h-full max-h-[440px] aspect-[2/3] w-auto'}
          ${materialId === 'canvas-wrap' ? 'rounded-xs shadow-2xl ring-1 ring-black/10' : 'rounded-xs'}
        `}
      >
        {/* Canvas Wrap Side Simulation */}
        {materialId === 'canvas-wrap' && (
          <div className="absolute inset-0 bg-stone-900/10 pointer-events-none mix-blend-multiply border-8 border-stone-400/30" />
        )}

        {/* Outer Frame Bevel highlight */}
        {materialId !== 'canvas-wrap' && (
          <div className="absolute inset-0 border border-white/5 pointer-events-none" />
        )}

        {/* Passe-Partout / Matting Border */}
        <div
          style={{
            backgroundColor: hasMatting ? mattingColor : 'transparent',
            padding: hasMatting ? '24px' : '0px',
            boxShadow: hasMatting ? 'inset 0 0 10px rgba(0,0,0,0.12)' : 'none',
          }}
          className="w-full h-full flex items-center justify-center transition-all duration-300 relative"
        >
          {/* Inner shadow/bevel for Matting */}
          {hasMatting && (
            <div className="absolute inset-0 border border-black/10 pointer-events-none m-[24px]" />
          )}

          {/* Actual Image Render */}
          <div className="relative w-full h-full overflow-hidden shadow-inner flex items-center justify-center bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Custom Frame Preview"
              className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-300"
            />

            {/* Glass Reflections */}
            {glassTypeId !== 'no-glass' && (
              <div
                className={`absolute inset-0 pointer-events-none select-none mix-blend-screen transition-all duration-300
                  ${glassTypeId === 'anti-glare-glass' 
                    ? 'bg-gradient-to-tr from-white/0 via-white/5 to-white/10 opacity-60' 
                    : 'bg-gradient-to-tr from-white/0 via-white/15 to-white/25'
                  }
                `}
                style={{
                  background: glassTypeId === 'anti-glare-glass'
                    ? 'linear-gradient(125deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, rgba(255,255,255,0) 70%)'
                    : 'linear-gradient(125deg, rgba(255,255,255,0) 20%, rgba(255,255,255,0.1) 40%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 60%, rgba(255,255,255,0) 80%)'
                }}
              />
            )}

            {/* Canvas Texture Overlay for Canvas Wrap */}
            {materialId === 'canvas-wrap' && (
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: 'radial-gradient(circle, #000 10%, transparent 11%), radial-gradient(circle, #000 10%, transparent 11%)',
                  backgroundSize: '3px 3px',
                  backgroundPosition: '0 0, 1.5px 1.5px'
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
