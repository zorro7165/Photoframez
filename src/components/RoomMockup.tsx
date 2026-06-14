'use client';

import React, { useState } from 'react';
import FramePreview from './FramePreview';

interface RoomMockupProps {
  imageUrl: string;
  materialId: string;
  borderId: string;
  customBorderColor: string;
  orientation: 'portrait' | 'landscape';
  glassTypeId: string;
  sizeId: string;
  customWidth: number;
  customHeight: number;
}

interface RoomTemplate {
  id: string;
  name: string;
  imageUrl: string;
  // Positioning percentage for frame center
  top: string;
  left: string;
  // Scale multiplier for width
  baseScale: number;
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    id: 'living-room',
    name: 'Modern Living Room',
    imageUrl: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=1200&q=80',
    top: '32%',
    left: '50%',
    baseScale: 0.8
  },
  {
    id: 'bedroom',
    name: 'Cozy Bedroom',
    imageUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=80',
    top: '28%',
    left: '50%',
    baseScale: 0.75
  },
  {
    id: 'office',
    name: 'Creative Office',
    imageUrl: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80',
    top: '30%',
    left: '50%',
    baseScale: 0.65
  }
];

export default function RoomMockup({
  imageUrl,
  materialId,
  borderId,
  customBorderColor,
  orientation,
  glassTypeId,
  sizeId,
  customWidth,
  customHeight
}: RoomMockupProps) {
  const [activeRoomId, setActiveRoomId] = useState<string>('living-room');

  const activeRoom = ROOM_TEMPLATES.find(r => r.id === activeRoomId) || ROOM_TEMPLATES[0];

  // Calculate scaling factor based on size selection
  const getSizeScale = () => {
    let w = 12; // default
    if (sizeId === '8x12') w = 12;
    else if (sizeId === '12x18') w = 18;
    else if (sizeId === '16x24') w = 24;
    else if (sizeId === '24x36') w = 36;
    else if (sizeId === 'custom') w = Math.max(customWidth, customHeight);

    // Map size width to screen percentage width (e.g. 12" -> 16%, 36" -> 40%)
    const minSize = 8;
    const maxSize = 36;
    const minPct = 12;
    const maxPct = 38;

    const pct = minPct + ((w - minSize) / (maxSize - minSize)) * (maxPct - minPct);
    return Math.min(Math.max(pct, minPct), maxPct) * activeRoom.baseScale;
  };

  const scaleWidth = getSizeScale();

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Visualizer Frame Container */}
      <div className="relative w-full aspect-video md:aspect-[16/10] bg-neutral-900 overflow-hidden rounded-xl border border-neutral-800 shadow-xl group">
        {/* Room Backdrop Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeRoom.imageUrl}
          alt={activeRoom.name}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none brightness-95"
        />

        {/* Dynamic Mounted Frame Component */}
        <div
          style={{
            position: 'absolute',
            top: activeRoom.top,
            left: activeRoom.left,
            transform: 'translate(-50%, -50%)',
            width: `${scaleWidth}%`,
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: 'drop-shadow(0 25px 30px rgba(0,0,0,0.55))'
          }}
          className="z-10 cursor-pointer pointer-events-none"
        >
          <FramePreview
            imageUrl={imageUrl}
            materialId={materialId}
            borderId={borderId}
            customBorderColor={customBorderColor}
            orientation={orientation}
            glassTypeId={glassTypeId}
          />
        </div>

        {/* Ambient Room Lighting overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/10 via-transparent to-white/5 pointer-events-none" />

        {/* Room Info Tag */}
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 shadow-lg">
          Mockup Scale: {sizeId === 'custom' ? `${customWidth}×${customHeight}"` : sizeId} Frame on wall
        </div>
      </div>

      {/* Room Selector Tab Bar */}
      <div className="flex justify-center gap-2">
        {ROOM_TEMPLATES.map((room) => (
          <button
            key={room.id}
            onClick={() => setActiveRoomId(room.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200
              ${activeRoomId === room.id
                ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-neutral-900 dark:border-white shadow-md'
                : 'bg-white hover:bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-800'
              }
            `}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
}
