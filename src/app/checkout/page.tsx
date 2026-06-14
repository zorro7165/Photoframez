'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CreditCard, Truck, AlertCircle, ShoppingBag, ShieldCheck, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart, router]);

  // Shipping form fields state
  const [shippingForm, setShippingForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'UPI' | 'COD'>('Razorpay');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'init' | 'processing' | 'success'>('init');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Basic fields validation
    const { customerName, phone, email, address, city, state, pincode } = shippingForm;
    if (!customerName || !phone || !email || !address || !city || !state || !pincode) {
      setErrorMessage('Please fill out all shipping and contact details.');
      return;
    }

    if (paymentMethod === 'COD') {
      submitOrder('COD');
    } else {
      // Show Razorpay mock modal
      setShowPaymentModal(true);
      setPaymentStep('init');
    }
  };

  const triggerPaymentAuth = () => {
    setPaymentStep('processing');
    // Simulate Razorpay / UPI gateway authorization (2.5s)
    setTimeout(() => {
      setPaymentStep('success');
      // Fire confetti celebrating order placement!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      
      // Submit order details to db after successful payment simulation
      setTimeout(() => {
        submitOrder(paymentMethod);
      }, 1500);
    }, 2500);
  };

  const submitOrder = async (finalPaymentStatus: string) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...shippingForm,
          paymentStatus: finalPaymentStatus === 'COD' ? 'COD' : 'Paid',
          items: cart
        })
      });

      const data = await response.json();

      if (response.ok && data.orderNumber) {
        clearCart();
        setShowPaymentModal(false);
        // Take customer to tracking page
        router.push(`/orders/${data.orderNumber}`);
      } else {
        setErrorMessage(data.error || 'Failed to submit your order. Please try again.');
        setShowPaymentModal(false);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred during order submission.');
      setShowPaymentModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb banner */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-outfit">Secure Checkout</h1>
            <p className="text-xs text-neutral-500 mt-1">Provide your billing details and complete your frame customization order.</p>
          </div>

          {errorMessage && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-red-700 dark:text-red-400 text-xs">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {/* Form and Summary grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Shipping & Billing Form (7 cols) */}
            <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
              
              {/* Shipping Address Section */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs">
                <h3 className="text-base font-bold font-outfit border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4 flex items-center gap-2">
                  <Truck size={18} className="text-amber-600" />
                  1. Shipping & Contact Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">Full Name</label>
                    <input
                      required
                      type="text"
                      name="customerName"
                      value={shippingForm.customerName}
                      onChange={handleInputChange}
                      placeholder="e.g. Anbarasu G"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">Mobile Number</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={shippingForm.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">Email Address</label>
                    <input
                      required
                      type="email"
                      name="email"
                      value={shippingForm.email}
                      onChange={handleInputChange}
                      placeholder="e.g. name@example.com"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">Shipping Address</label>
                    <textarea
                      required
                      name="address"
                      rows={3}
                      value={shippingForm.address}
                      onChange={handleInputChange}
                      placeholder="Apartment, Street Name, Landmark"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">City</label>
                    <input
                      required
                      type="text"
                      name="city"
                      value={shippingForm.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Chennai"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">State</label>
                    <input
                      required
                      type="text"
                      name="state"
                      value={shippingForm.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-500">PIN Code</label>
                    <input
                      required
                      type="text"
                      name="pincode"
                      value={shippingForm.pincode}
                      onChange={handleInputChange}
                      placeholder="e.g. 600001"
                      className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:border-amber-600 outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs">
                <h3 className="text-base font-bold font-outfit border-b border-neutral-100 dark:border-neutral-800 pb-3 mb-4 flex items-center gap-2">
                  <CreditCard size={18} className="text-amber-600" />
                  2. Choose Payment Mode
                </h3>

                <div className="space-y-3">
                  {/* Razorpay (Mocked) */}
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200
                    ${paymentMethod === 'Razorpay'
                      ? 'border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
                    }
                  `}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'Razorpay'}
                        onChange={() => setPaymentMethod('Razorpay')}
                        className="text-amber-600 focus:ring-amber-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block">Razorpay Gateway (Cards / Netbanking)</span>
                        <span className="text-[10px] text-neutral-400">Secure digital authorization with automatic confirmations</span>
                      </div>
                    </div>
                  </label>

                  {/* UPI QR Payment (Mocked) */}
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200
                    ${paymentMethod === 'UPI'
                      ? 'border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
                    }
                  `}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="text-amber-600 focus:ring-amber-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block">UPI Transfer (Paytm / GPay / PhonePe)</span>
                        <span className="text-[10px] text-neutral-400">Generate QR code or pay via VPA handles</span>
                      </div>
                    </div>
                  </label>

                  {/* Cash on Delivery (COD) */}
                  <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all duration-200
                    ${paymentMethod === 'COD'
                      ? 'border-amber-600 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50'
                    }
                  `}>
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="text-amber-600 focus:ring-amber-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block">Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-neutral-400">Pay when your framed print arrives (+₹50 fee)</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-500">+₹50</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm shadow-lg shadow-amber-600/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Processing Order...' : `Place Order • ₹${(cartTotal + (paymentMethod === 'COD' ? 50 : 0)).toLocaleString('en-IN')}`}
              </button>
            </form>

            {/* Right Column: Order Summary (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="text-base font-bold font-outfit border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
                <ShoppingBag size={18} className="text-amber-600" />
                Order Summary
              </h3>

              {/* Item Cards */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-3 text-xs">
                    <div className="h-14 w-14 flex-shrink-0 rounded-md border border-neutral-100 dark:border-neutral-800 overflow-hidden bg-neutral-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between font-bold text-neutral-800 dark:text-neutral-150">
                        <span className="line-clamp-1">{item.title}</span>
                        <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Qty: {item.quantity} • Size: {item.sizeId === 'custom' ? `${item.customWidth}x${item.customHeight}"` : item.sizeId}
                      </p>
                      <p className="text-[9px] text-neutral-400 capitalize">
                        {item.materialId.replace('-', ' ')} ({item.borderId.replace('-', ' ')})
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cost Details */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-2.5 text-xs text-neutral-500">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="font-bold text-neutral-800 dark:text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Handling</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                {paymentMethod === 'COD' && (
                  <div className="flex justify-between text-neutral-500 animate-fade-in">
                    <span>COD Fee</span>
                    <span className="font-bold text-neutral-800 dark:text-white">₹50</span>
                  </div>
                )}
                <div className="border-t border-neutral-150 dark:border-neutral-800 pt-3 flex justify-between text-sm font-bold text-neutral-900 dark:text-white">
                  <span>Grand Total</span>
                  <span className="text-lg text-amber-600">
                    ₹{(cartTotal + (paymentMethod === 'COD' ? 50 : 0)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Guarantees Tag */}
              <div className="bg-neutral-50 dark:bg-neutral-950 p-4 rounded-xl flex gap-3 text-[11px] text-neutral-400">
                <ShieldCheck size={18} className="text-amber-600 flex-shrink-0" />
                <p>Your transaction is secure. Frames are bubble-wrapped in triple-walled carton crates to ensure damage-free transit.</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />

      {/* Razorpay Simulated Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 animate-fade-in">
            {/* Modal header */}
            <div className="bg-slate-950 px-6 py-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-amber-600 rounded-md flex items-center justify-center text-[11px] font-black italic">R</div>
                <span className="text-sm font-black tracking-wider text-slate-200">razorpay</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Test Gateway</span>
            </div>

            {/* Modal Content */}
            <div className="p-6 flex flex-col items-center text-center gap-6">
              
              {paymentStep === 'init' && (
                <>
                  <div className="rounded-full bg-slate-800 p-4 text-amber-500">
                    {paymentMethod === 'UPI' ? <QrCode size={40} /> : <CreditCard size={40} />}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-100">Authorize Simulated Payment</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Pay <strong>₹{(cartTotal + (paymentMethod === 'COD' ? 50 : 0)).toLocaleString('en-IN')}</strong> via {paymentMethod === 'UPI' ? 'UPI Handle' : 'Razorpay Credit Card'}.
                    </p>
                  </div>

                  <div className="flex gap-2 w-full mt-2">
                    <button
                      onClick={triggerPaymentAuth}
                      className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition"
                    >
                      Authorize Payment
                    </button>
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-lg text-xs transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="py-6 flex flex-col items-center gap-4">
                  {/* Premium Spinner */}
                  <div className="h-10 w-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Securing Transaction...</h4>
                    <p className="text-xs text-slate-400 mt-1">Connecting to bank server to authorize debit request.</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 flex flex-col items-center gap-4 animate-scale-up">
                  <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-500/25">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">Payment Successful!</h4>
                    <p className="text-xs text-slate-400 mt-1">Transaction ID: TXN_MOCK_{Math.floor(Math.random() * 900000 + 100000)}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
