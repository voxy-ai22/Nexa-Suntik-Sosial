import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminKey } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    
    if (verifyAdminKey(key)) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ message: 'Invalid Admin Key' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}