import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/frames - Retrieve all catalog frames
export async function GET() {
  try {
    const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching frames:', error);
    return NextResponse.json({ error: 'Failed to fetch frames' }, { status: 500 });
  }
}

// POST /api/frames - Add a new frame, auto-generating a Frame ID
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, imageUrl, category, tags } = body;

    if (!title || !imageUrl) {
      return NextResponse.json({ error: 'Title and Image URL are required' }, { status: 400 });
    }

    // Auto-generate Frame ID (e.g., FRM1005)
    // 1. Fetch the latest frame ID
    const latestFrame = await prisma.image.findFirst({
      orderBy: { frameId: 'desc' }
    });

    let newFrameId = 'FRM1001';
    if (latestFrame) {
      const match = latestFrame.frameId.match(/FRM(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        newFrameId = `FRM${nextNum}`;
      }
    }

    const newImage = await prisma.image.create({
      data: {
        frameId: newFrameId,
        title,
        description: description || '',
        imageUrl,
        thumbnailUrl: imageUrl, // for simplicity, use same URL
        category: category || 'General',
        tags: tags || ''
      }
    });

    return NextResponse.json(newImage, { status: 201 });
  } catch (error) {
    console.error('Error creating frame:', error);
    return NextResponse.json({ error: 'Failed to add new frame' }, { status: 500 });
  }
}
