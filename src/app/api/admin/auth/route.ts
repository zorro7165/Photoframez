import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as crypto from 'crypto';

// GET /api/admin/auth - Validate active session cookie
export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get('admin_session');
  if (sessionCookie?.value === 'authenticated') {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}

// POST /api/admin/auth - Login and issue cookie
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { username }
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Compute incoming password hash
    const inputHash = crypto.createHash('sha256').update(password).digest('hex');

    if (inputHash !== admin.passwordHash) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, username: admin.username });
    
    // Set HTTP-only cookie
    response.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 4 // 4 hours
    });

    return response;
  } catch (error) {
    console.error('Admin authentication error:', error);
    return NextResponse.json({ error: 'Internal authentication server error' }, { status: 500 });
  }
}
