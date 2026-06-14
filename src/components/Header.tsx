'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, X, Trash2, Plus, Minus, FileText, Settings } from 'lucide-react';

export default function Header() {
  const { cart, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/80 transition-colors duration-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent group-hover:opacity-85 transition-opacity">
                Ritwika&apos;s
              </span>
              <span className="text-sm font-semibold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase">
                Frames
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-300">
            <Link href="/" className="hover:text-amber-600 transition-colors">
              Gallery
            </Link>
            <Link href="/orders/track" className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
              <FileText size={16} />
              Track Order
            </Link>
            <Link href="/admin" className="flex items-center gap-1.5 hover:text-amber-600 transition-colors">
              <Settings size={16} />
              Admin Panel
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative rounded-full p-2.5 text-neutral-600 hover:bg-neutral-100 hover:text-amber-600 dark:text-neutral-300 dark:hover:bg-neutral-800 transition-all duration-200"
              aria-label="Open Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-out Cart Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop shadow */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 animate-slide-in">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-amber-600" size={20} />
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Shopping Cart</h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-neutral-100 p-6 dark:bg-neutral-800 text-neutral-400 mb-4">
                    <ShoppingBag size={40} />
                  </div>
                  <h3 className="text-md font-bold text-neutral-900 dark:text-white">Your cart is empty</h3>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Find frames you love on Instagram or configure one from our gallery.
                  </p>
                  <Link
                    href="/"
                    onClick={() => setIsDrawerOpen(false)}
                    className="mt-6 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 shadow-md shadow-amber-600/20 transition-all duration-200"
                  >
                    Browse Catalog
                  </Link>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
                    {/* Image Preview Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Metadata & Operations */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-sm font-semibold text-neutral-900 dark:text-white">
                          <h4 className="line-clamp-1">{item.title}</h4>
                          <span className="ml-4 text-amber-600 font-bold">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 capitalize">
                          Size: {item.sizeId === 'custom' ? `${item.customWidth}x${item.customHeight}"` : item.sizeId} |{' '}
                          {item.materialId.replace('-', ' ')}
                        </p>
                        <p className="text-[10px] text-neutral-400">
                          {item.glassTypeId.replace('-', ' ')} | {item.borderId.replace('-', ' ')}
                        </p>
                      </div>

                      {/* Quantity Toggles */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-950">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:text-amber-600 dark:text-neutral-400"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:text-amber-600 dark:text-neutral-400"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer Summary */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-200 px-6 py-6 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
                <div className="flex justify-between text-base font-bold text-neutral-900 dark:text-white">
                  <span>Subtotal</span>
                  <span className="text-lg text-amber-600">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                  <Link
                    href="/checkout"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-amber-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-amber-700 shadow-md shadow-amber-600/20 hover:shadow-lg transition-all duration-200"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
