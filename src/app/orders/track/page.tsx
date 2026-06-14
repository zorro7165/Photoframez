'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, FileText, AlertCircle } from 'lucide-react';

export default function TrackOrderPortal() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState('');
  const [error, setError] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const formattedQuery = orderQuery.trim();
    if (!formattedQuery) {
      setError('Please enter a valid order number.');
      return;
    }

    if (!formattedQuery.startsWith('ORD-') && formattedQuery.length < 10) {
      setError('Order numbers typically format like: ORD-YYYY-XXXXXX');
      return;
    }

    router.push(`/orders/${formattedQuery}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center">
            <FileText size={24} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black font-outfit">Track Your Frame Order</h1>
            <p className="text-xs text-neutral-400">Enter your order reference code from your SMS, Email, or Invoice.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-left p-3.5 bg-red-50 dark:bg-red-955/20 border border-red-200 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 text-xs">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleTrackSubmit} className="space-y-4 text-left">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Reference Number</label>
              <div className="relative flex items-center">
                <input
                  required
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. ORD-2026-001001"
                  className="w-full pl-3 pr-10 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden font-mono text-center uppercase tracking-widest text-neutral-800 dark:text-white font-bold"
                />
                <Search size={14} className="absolute right-3.5 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-md shadow-amber-600/10 transition"
            >
              Check Status
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
