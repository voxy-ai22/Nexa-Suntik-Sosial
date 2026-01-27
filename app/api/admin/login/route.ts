import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    
    // Sekarang mengambil kunci dari environment variable KEY_ADMIN
    const ADMIN_KEY = process.env.KEY_ADMIN;

    if (!ADMIN_KEY) {
      console.error("Environment variable KEY_ADMIN belum dikonfigurasi!");
      return NextResponse.json({ message: 'Server Configuration Error' }, { status: 500 });
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
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}