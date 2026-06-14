import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { calculateTotalPrice, CustomizationState } from '@/lib/constants';
import { sendEmailNotification, sendWhatsAppNotification } from '@/lib/notifications';

// GET /api/orders - Fetch all orders (for Admin Dashboard)
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// POST /api/orders - Create a new order with validation and notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      phone,
      email,
      address,
      city,
      state,
      pincode,
      paymentStatus, // 'Pending' | 'Paid' | 'COD'
      items // Array of items
    } = body;

    // Basic Validation
    if (!customerName || !phone || !email || !address || !city || !state || !pincode || !items || items.length === 0) {
      return NextResponse.json({ error: 'All shipping details and cart items are required' }, { status: 400 });
    }

    // 1. Calculate and validate total price on the server
    let computedTotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const config: CustomizationState = {
        sizeId: item.sizeId,
        customWidth: item.customWidth || 12,
        customHeight: item.customHeight || 12,
        materialId: item.materialId,
        glassTypeId: item.glassTypeId,
        borderId: item.borderId,
        customBorderColor: item.customBorderColor || '#ffffff',
        orientation: item.orientation,
        quantity: item.quantity
      };

      const unitPrice = calculateTotalPrice({ ...config, quantity: 1 });
      const itemPriceSum = unitPrice * item.quantity;
      computedTotal += itemPriceSum;

      orderItemsData.push({
        frameId: item.frameId,
        selectedSize: item.sizeId === 'custom' ? `Custom (${item.customWidth}x${item.customHeight}")` : item.sizeId,
        selectedMaterial: item.materialId,
        selectedGlass: item.glassTypeId,
        selectedBorder: item.borderId === 'custom-border' ? `Custom (${item.customBorderColor})` : item.borderId,
        quantity: item.quantity,
        price: unitPrice
      });
    }

    // 2. Generate unique order number (e.g. ORD-2026-000105)
    const currentYear = new Date().getFullYear();
    const count = await prisma.order.count();
    const orderNumber = `ORD-${currentYear}-${String(count + 1001).padStart(6, '0')}`;

    // 3. Save order using transaction
    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        paymentStatus,
        orderStatus: 'Placed',
        totalAmount: computedTotal,
        items: {
          create: orderItemsData
        }
      },
      include: {
        items: true
      }
    });

    // 4. Trigger Async Notifications
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const trackingLink = `${appUrl}/orders/track?orderNumber=${orderNumber}`;

    // A. Send Email Confirmation
    const emailSubject = `Order Confirmed: ${orderNumber} - Ritwika's Custom Frames`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #d97706; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">Order Confirmed!</h2>
        <p>Thank you for shopping with us, <strong>${customerName}</strong>.</p>
        <p>Your order <strong>${orderNumber}</strong> has been successfully placed. We are preparing your customizations.</p>
        
        <h3 style="margin-top: 24px;">Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">Item</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">Qty</th>
              <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any) => `
              <tr>
                <td style="border: 1px solid #e5e7eb; padding: 8px;">
                  <strong>${item.title}</strong><br/>
                  <span style="font-size: 11px; color: #666;">
                    Size: ${item.sizeId === 'custom' ? `${item.customWidth}x${item.customHeight}"` : item.sizeId} | 
                    Material: ${item.materialId.replace('-', ' ')} | 
                    Glass: ${item.glassTypeId.replace('-', ' ')}
                  </span>
                </td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold;">
              <td colspan="2" style="border: 1px solid #e5e7eb; padding: 8px; text-align: right;">Total Paid</td>
              <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: right; color: #d97706;">₹${computedTotal.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
        </table>

        <h3 style="margin-top: 24px;">Shipping Address:</h3>
        <p>${address},<br/>${city}, ${state} - ${pincode}</p>
        
        <div style="margin-top: 32px; text-align: center;">
          <a href="${trackingLink}" style="background-color: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Track Your Order
          </a>
        </div>
      </div>
    `;

    // Trigger dispatches (ignoring await failures to not block checkout response)
    sendEmailNotification(newOrder.id, email, emailSubject, emailHtml).catch(console.error);

    // B. Send WhatsApp Confirmation
    const whatsappMsg = `Hi ${customerName},\n\nThank you for ordering from Ritwika's Custom Frames! 🌟\n\nYour Order ID is ${orderNumber}.\nTotal Amount: ₹${computedTotal.toLocaleString('en-IN')}.\nWe have started working on your print. We will notify you once it heads out for framing!\n\nTrack your order in real-time here: ${trackingLink}`;
    sendWhatsAppNotification(newOrder.id, phone, whatsappMsg).catch(console.error);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
