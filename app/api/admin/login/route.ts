import { NextRequest, NextResponse } from 'next/server';

const ADMIN_KEY = "pFBenCy/X3Y53LboNgA00mtt7P/d4IOmxBQ63HewPNw=";

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    
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