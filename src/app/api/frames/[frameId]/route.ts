import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ frameId: string }> }
) {
  try {
    const { frameId } = await params;

    const image = await prisma.image.findUnique({
      where: { frameId }
    });

    if (!image) {
      return NextResponse.json({ error: 'Frame not found' }, { status: 404 });
    }

    return NextResponse.json(image);
  } catch (error) {
    console.error('Error fetching frame details:', error);
    return NextResponse.json({ error: 'Failed to fetch frame details' }, { status: 500 });
  }
}
