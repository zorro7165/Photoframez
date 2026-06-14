import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT /api/admin/orders/[orderId] - Update order metrics (status and payments)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await req.json();
    const { orderStatus, paymentStatus } = body;

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: orderStatus !== undefined ? orderStatus : order.orderStatus,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : order.paymentStatus
      }
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error modifying order:', error);
    return NextResponse.json({ error: 'Failed to update order metrics' }, { status: 500 });
  }
}
