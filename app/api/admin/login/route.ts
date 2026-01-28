import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    const ADMIN_KEY = process.env.API_ADMIN_KEY;

    if (!ADMIN_KEY) {
      console.error("Critical: API_ADMIN_KEY not set in environment!");
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }
    
    if (key === ADMIN_KEY) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 jam
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ message: 'Invalid Admin Key' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}