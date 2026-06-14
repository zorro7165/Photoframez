import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CustomizerClient from './CustomizerClient';

interface PageProps {
  params: Promise<{ frameId: string }>;
}

export const revalidate = 0; // Prevent dynamic route caching to ensure database updates reflect instantly

// Dynamic SEO Metadata Generator for dynamic frame urls
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { frameId } = await params;

  try {
    const image = await prisma.image.findUnique({
      where: { frameId }
    });

    if (!image) {
      return {
        title: 'Frame Design Not Found - Ritwika\'s',
        description: 'The requested personalized photo frame layout could not be found.'
      };
    }

    return {
      title: `Customize "${image.title}" Premium Framed Print Online - Ritwika's`,
      description: `Configure and buy high quality framed art print of "${image.title}" (${image.frameId}). Select custom frame sizes, walnut wood, canvas wrappers, and anti-glare glass.`,
      openGraph: {
        title: `Buy ${image.title} Premium Custom Frame Online`,
        description: image.description,
        type: 'article',
        images: [
          {
            url: image.imageUrl,
            width: 1200,
            height: 800,
            alt: image.title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title: `Customize "${image.title}" Framed Print Online`,
        description: image.description,
        images: [image.imageUrl]
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Personalized Photo Frame - Ritwika\'s'
    };
  }
}

export default async function FramePage({ params }: PageProps) {
  const { frameId } = await params;

  // Retrieve frame specifications from the database
  let image = null;
  try {
    image = await prisma.image.findUnique({
      where: { frameId }
    });
  } catch (error) {
    console.error('Database query error on frame fetch:', error);
  }

  if (!image) {
    notFound(); // Triggers default Next.js 404 page
  }

  return <CustomizerClient image={image} />;
}
