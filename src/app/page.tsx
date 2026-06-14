import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Sparkles, Heart, ArrowRight } from 'lucide-react';

export const revalidate = 0; // Disable caching to fetch newly uploaded images instantly

export default async function HomePage() {
  // Fetch all frames from database
  let frames: Array<{ id: string; frameId: string; title: string; description: string; imageUrl: string; thumbnailUrl: string; category: string; tags: string; createdAt: Date }> = [];
  try {
    frames = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch frames for catalog:', error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
        {/* Hero Banner */}
        <section className="relative overflow-hidden py-20 px-6 sm:px-12 text-center bg-radial from-amber-500/10 via-transparent to-transparent">
          <div className="mx-auto max-w-4xl flex flex-col items-center gap-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-500 border border-amber-200/50 dark:border-amber-900/50">
              <Sparkles size={12} />
              Instagram Frame Customizer
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-outfit bg-gradient-to-r from-neutral-900 via-neutral-800 to-amber-600 dark:from-white dark:via-neutral-100 dark:to-amber-500 bg-clip-text text-transparent leading-tight">
              Instantly Frame Your Favorite Discoveries
            </h1>

            <p className="max-w-2xl text-base sm:text-lg text-neutral-500 dark:text-neutral-400">
              Discovered a stunning wallpaper, quote, or photo on Instagram? 
              Click the link on the post, customize your dimensions, choose solid wood frames, and order in minutes.
            </p>
          </div>
        </section>

        {/* Journey Simulation Panel */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="bg-amber-600/5 dark:bg-amber-500/5 rounded-2xl border border-amber-600/10 p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-sm">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                  </svg>
                  Simulate the Instagram Journey
                </div>
                <h2 className="text-xl font-bold font-outfit">Test Instagram Link Redirects</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Each Instagram post includes a dynamic redirect link. Click one of these links to see the customizer automatically load that exact image.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto flex-shrink-0">
                {frames.map((frame) => (
                  <Link
                    key={frame.frameId}
                    href={`/frame/${frame.frameId}`}
                    className="flex flex-col items-center justify-center p-3.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-600 dark:hover:border-amber-600 rounded-xl text-center shadow-xs transition-all duration-200 group"
                  >
                    <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 group-hover:text-amber-600 transition-colors uppercase tracking-wider">
                      {frame.frameId}
                    </span>
                    <span className="text-[11px] font-semibold mt-1 text-neutral-800 dark:text-neutral-200 line-clamp-1">
                      {frame.title.split(' ')[0]} Frame
                    </span>
                    <span className="text-[9px] text-amber-600 flex items-center gap-0.5 mt-2">
                      Click to Test <ArrowRight size={10} />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Catalog */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-black font-outfit text-neutral-900 dark:text-white flex items-center gap-2">
              Featured Frame Designs
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Select a design to start custom framing.</p>
          </div>

          {frames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-neutral-400 font-medium">No frames found in database. Run database seed script first.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {frames.map((frame) => (
                <div
                  key={frame.frameId}
                  className="flex flex-col bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs hover:shadow-md transition-all duration-250 group"
                >
                  {/* Photo Thumbnail */}
                  <div className="relative aspect-4/3 overflow-hidden bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={frame.imageUrl}
                      alt={frame.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-md">
                      {frame.frameId}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500">
                          {frame.category}
                        </span>
                        <div className="flex items-center text-neutral-300 dark:text-neutral-700">
                          <Heart size={14} className="fill-current hover:text-red-500 cursor-pointer" />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold mt-1 text-neutral-800 dark:text-neutral-100 line-clamp-1">
                        {frame.title}
                      </h3>
                      <p className="text-xs text-neutral-400 dark:text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                        {frame.description}
                      </p>
                    </div>

                    <Link
                      href={`/frame/${frame.frameId}`}
                      className="mt-5 flex w-full items-center justify-center gap-1 bg-neutral-900 hover:bg-amber-600 text-white dark:bg-neutral-800 dark:hover:bg-amber-600 text-xs font-bold py-2.5 px-4 rounded-lg shadow-xs transition-all duration-200"
                    >
                      Personalise Frame
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
