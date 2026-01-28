import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    // Using strictly defined key from user instructions
    const ADMIN_KEY = process.env.KEY_ADMIN;

    if (!ADMIN_KEY) {
      console.error("Critical: KEY_ADMIN not found in Environment Variables.");
      return NextResponse.json({ message: 'Configuration missing' }, { status: 500 });
    }
    
    if (key === ADMIN_KEY) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 Hours
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ message: 'Invalid Admin Key' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ message: 'Login processing failed' }, { status: 500 });
  }
}