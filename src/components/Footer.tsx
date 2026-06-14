import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-md font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              Ritwika&apos;s Custom Frames
            </span>
            <span className="text-xs text-neutral-400">© 2026. All rights reserved.</span>
          </div>

          <div className="flex gap-6 text-xs text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="hover:text-amber-600 transition-colors">
              Gallery Catalog
            </Link>
            <Link href="/orders/track" className="hover:text-amber-600 transition-colors">
              Track My Order
            </Link>
            <Link href="/admin" className="hover:text-amber-600 transition-colors">
              Admin Area
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
