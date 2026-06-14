'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, cartTotal, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit">My Shopping Cart</h1>
            <p className="text-xs text-neutral-400 mt-1">Verify your photo customizer configurations before billing.</p>
          </div>

          {cart.length === 0 ? (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
              <div className="h-16 w-16 bg-neutral-100 dark:bg-neutral-850 text-neutral-400 rounded-full flex items-center justify-center">
                <ShoppingBag size={30} />
              </div>
              <h2 className="text-lg font-bold">Your cart is empty</h2>
              <p className="text-xs text-neutral-500 max-w-sm">You haven&apos;t added any customized frames to your cart yet. Browse our gallery and configure yours today!</p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-6 py-3 rounded-lg shadow-md transition"
              >
                Explore Art Designs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Items List (8 cols) */}
              <div className="lg:col-span-8 space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 rounded-2xl flex gap-4 shadow-xs"
                  >
                    {/* Thumbnail */}
                    <div className="h-20 w-20 flex-shrink-0 bg-neutral-50 border border-neutral-100 dark:border-neutral-800 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    </div>

                    {/* Metadata & Actions */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">{item.title}</h3>
                          <p className="text-[10px] text-neutral-500 mt-1 capitalize">
                            Size: {item.sizeId === 'custom' ? `${item.customWidth}x${item.customHeight}"` : item.sizeId} |{' '}
                            {item.materialId.replace('-', ' ')}
                          </p>
                          <p className="text-[9px] text-neutral-400 capitalize">
                            Glass: {item.glassTypeId.replace('-', ' ')} | Matting: {item.borderId.replace('-', ' ')}
                          </p>
                        </div>
                        <span className="text-sm font-black text-amber-600">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Stepper */}
                        <div className="flex items-center border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-950">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 px-2 hover:text-amber-600 text-neutral-400"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-neutral-800 dark:text-neutral-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 px-2 hover:text-amber-600 text-neutral-400"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1 transition"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Subtotals (4 cols) */}
              <div className="lg:col-span-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-outfit border-b border-neutral-100 dark:border-neutral-800 pb-2">Order Summary</h3>
                
                <div className="space-y-2 text-xs text-neutral-500">
                  <div className="flex justify-between">
                    <span>Cart Subtotal</span>
                    <span className="font-bold text-neutral-800 dark:text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
                    <span>Total Amount</span>
                    <span className="text-base text-amber-600">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="w-full mt-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={13} />
                </Link>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
