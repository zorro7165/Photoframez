import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import OrderClient from './OrderClient';

interface PageProps {
  params: Promise<{ orderId: string }>;
}

export const revalidate = 0; // Prevent dynamic order page caching so status changes propagate instantly

// Privacy-focused SEO metadata for invoice pages (noindex)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Track Order: ${orderId} - Ritwika's Custom Frames`,
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { orderId } = await params;

  let order = null;
  try {
    order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId }
        ]
      },
      include: {
        items: true
      }
    });
  } catch (error) {
    console.error('Database query error on order fetch:', error);
  }

  if (!order) {
    notFound();
  }

  // Convert dates to string to avoid serialization issues between server and client
  const serializedOrder = {
    ...order,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(item => ({
      ...item,
      price: Number(item.price)
    }))
  };

  return <OrderClient order={serializedOrder} />;
}
