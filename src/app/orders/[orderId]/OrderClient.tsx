'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { jsPDF } from 'jspdf';
import { Check, Download, ExternalLink, Calendar, MapPin, Phone, CreditCard } from 'lucide-react';

interface OrderClientProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    paymentStatus: string;
    orderStatus: string; // Placed, Confirmed, Printing, Framing, Shipped, Delivered
    totalAmount: number;
    createdAt: string;
    items: Array<{
      id: string;
      frameId: string;
      selectedSize: string;
      selectedMaterial: string;
      selectedGlass: string;
      selectedBorder: string;
      quantity: number;
      price: number;
    }>;
  };
}

const STEPS = [
  { id: 'Placed', name: 'Order Placed', desc: 'Awaiting dispatch authorization' },
  { id: 'Confirmed', name: 'Confirmed', desc: 'Craftsman assigned' },
  { id: 'Printing', name: 'Printing', desc: 'High-res matte printing' },
  { id: 'Framing', name: 'Framing', desc: 'Fitting premium solid wood border' },
  { id: 'Shipped', name: 'Shipped Out', desc: 'Dispatched via air priority courier' },
  { id: 'Delivered', name: 'Delivered', desc: 'Arrived at your doorstep safely' }
];

export default function OrderClient({ order }: OrderClientProps) {
  const currentStepIndex = STEPS.findIndex(s => s.id === order.orderStatus);

  const downloadPDFInvoice = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // 1. Header Branding
    doc.setFillColor(31, 41, 55); // Dark gray header bar
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text("RITWIKA'S CUSTOM FRAMES", 15, 18);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("Premium Personalized Framed Prints Online", 15, 26);
    doc.text("contact@ritwikasframes.com | +91 98765 43210", 15, 32);

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('INVOICE', 160, 24);

    // 2. Metadata details
    doc.setTextColor(50, 50, 50);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Order Number:`, 15, 55);
    doc.text(`Invoice Date:`, 15, 61);
    doc.text(`Payment Mode:`, 15, 67);

    doc.setFont('Helvetica', 'normal');
    doc.text(order.orderNumber, 45, 55);
    doc.text(new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' }), 45, 61);
    doc.text(order.paymentStatus === 'COD' ? 'Cash on Delivery (COD)' : 'Prepaid (Razorpay Gateway)', 45, 67);

    // 3. Shipping Details
    doc.setFont('Helvetica', 'bold');
    doc.text('Deliver To:', 120, 55);
    doc.setFont('Helvetica', 'normal');
    doc.text(order.customerName, 120, 61);
    
    // Multi-line address wrapper
    const splitAddress = doc.splitTextToSize(order.address, 75);
    doc.text(splitAddress, 120, 67);
    doc.text(`${order.city}, ${order.state} - ${order.pincode}`, 120, 67 + (splitAddress.length * 5));

    // 4. Line Items Table Header
    const tableTop = 95;
    doc.setFillColor(243, 244, 246); // Light gray table header
    doc.rect(15, tableTop, 180, 8, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Item Customizations', 18, tableTop + 5.5);
    doc.text('Qty', 135, tableTop + 5.5);
    doc.text('Unit Price', 150, tableTop + 5.5);
    doc.text('Total', 178, tableTop + 5.5);

    // 5. Render Table Items
    let currentY = tableTop + 14;
    doc.setFont('Helvetica', 'normal');

    order.items.forEach((item, index) => {
      // Background row color alternating
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(15, currentY - 5, 180, 10, 'F');
      }

      doc.setFont('Helvetica', 'bold');
      doc.text(`Custom Framed Art (${item.frameId})`, 18, currentY);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.text(
        `Size: ${item.selectedSize} | Frame: ${item.selectedMaterial.replace('-', ' ')} | Glass: ${item.selectedGlass.replace('-', ' ')}`,
        18,
        currentY + 4
      );

      doc.setFontSize(9);
      doc.text(String(item.quantity), 136, currentY);
      doc.text(`INR ${item.price.toLocaleString('en-IN')}`, 150, currentY);
      doc.text(`INR ${(item.price * item.quantity).toLocaleString('en-IN')}`, 178, currentY);

      currentY += 12;
    });

    // 6. Draw Totals divider
    doc.setDrawColor(220, 220, 220);
    doc.line(15, currentY + 2, 195, currentY + 2);

    // 7. Render Subtotals
    currentY += 10;
    doc.setFont('Helvetica', 'normal');
    doc.text('Subtotal:', 140, currentY);
    doc.text(`INR ${order.totalAmount.toLocaleString('en-IN')}`, 178, currentY);

    currentY += 6;
    doc.text('Delivery Charge:', 140, currentY);
    doc.text('FREE', 178, currentY);

    currentY += 8;
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('Grand Total:', 140, currentY);
    doc.text(`INR ${order.totalAmount.toLocaleString('en-IN')}`, 178, currentY);

    // 8. Footer Message
    doc.setTextColor(150, 150, 150);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.text("Thank you for shopping with us! All frames are custom handmade with real organic materials.", 105, 275, { align: 'center' });
    doc.text("For help regarding returns, please contact support@ritwikasframes.com within 7 days.", 105, 280, { align: 'center' });

    // Save File
    doc.save(`Invoice_${order.orderNumber}.pdf`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          
          {/* Order Banner Card */}
          <div className="bg-emerald-600/5 dark:bg-emerald-500/5 border border-emerald-500/20 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold text-sm">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] font-bold">✓</span>
                Order Customization Saved
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-outfit">Thank you for your order!</h1>
              <p className="text-xs text-neutral-500">Your order has been recorded. Reference code: <strong className="text-neutral-700 dark:text-neutral-300 font-mono">{order.orderNumber}</strong></p>
            </div>

            <button
              onClick={downloadPDFInvoice}
              className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-amber-600 dark:bg-neutral-850 dark:hover:bg-amber-600 text-white px-5 py-3 rounded-xl text-xs font-bold shadow-md shadow-neutral-950/10 hover:shadow-lg transition-all duration-200"
            >
              <Download size={15} />
              Download PDF Invoice
            </button>
          </div>

          {/* Workflow Status Tracker Timeline */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-xs">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-neutral-400 mb-6">Order Status Timeline</h3>
            
            {/* Visual Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
              {STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-row md:flex-col items-start gap-4 md:gap-3 md:text-center relative">
                    
                    {/* Circle Indicator */}
                    <div className="flex flex-col items-center flex-shrink-0 z-10 md:mx-auto">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300
                          ${isCompleted 
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20' 
                            : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-400'
                          }
                          ${isCurrent ? 'ring-4 ring-amber-600/20 animate-pulse' : ''}
                        `}
                      >
                        {isCompleted ? <Check size={14} /> : idx + 1}
                      </div>
                    </div>

                    {/* Step descriptions */}
                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold transition-colors ${isCompleted ? 'text-neutral-950 dark:text-white' : 'text-neutral-400'}`}>
                        {step.name}
                      </h4>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-snug">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Progress bar line overlay (desktop only) */}
              <div className="hidden md:block absolute top-[15px] left-[6%] right-[6%] h-[2px] bg-neutral-200 dark:bg-neutral-800 z-0">
                <div
                  className="h-full bg-amber-600 transition-all duration-500"
                  style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details split panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Delivery address details */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold font-outfit border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <MapPin size={16} className="text-amber-600" />
                Shipping Coordinates
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-neutral-400 block">Name:</span>
                  <span className="font-bold">{order.customerName}</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-neutral-400 block">Phone:</span>
                    <span className="font-semibold">{order.phone}</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-neutral-400 block">Email:</span>
                    <span className="font-semibold line-clamp-1">{order.email}</span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 block">Full Address:</span>
                  <p className="font-medium mt-0.5 leading-relaxed">
                    {order.address},<br />
                    {order.city}, {order.state} - {order.pincode}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment & Itemizations summary */}
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold font-outfit border-b border-neutral-100 dark:border-neutral-800 pb-2 flex items-center gap-2">
                <CreditCard size={16} className="text-amber-600" />
                Payment Metrics
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Payment Status</span>
                    <span className={`font-bold inline-flex items-center gap-1 mt-0.5
                      ${order.paymentStatus === 'COD' ? 'text-amber-600' : 'text-emerald-600'}
                    `}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 block text-[10px]">Grand Total</span>
                    <span className="text-lg font-black text-amber-600">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-neutral-400 block">Item Configurations:</span>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start gap-4 border-b border-neutral-100 dark:border-neutral-850 pb-2">
                      <div>
                        <span className="font-bold block text-[11px] text-neutral-850 dark:text-neutral-200">
                          Custom Frame ({item.frameId})
                        </span>
                        <span className="text-[10px] text-neutral-400">
                          Qty: {item.quantity} • Size: {item.selectedSize}
                        </span>
                      </div>
                      <span className="font-bold text-neutral-800 dark:text-neutral-150">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          <div className="text-center pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition"
            >
              Continue Browsing Gallery →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
