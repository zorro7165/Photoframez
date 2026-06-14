import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/notifications - Retrieve recent dispatch logs
export async function GET() {
  try {
    const logs = await prisma.notificationLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching notification logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
