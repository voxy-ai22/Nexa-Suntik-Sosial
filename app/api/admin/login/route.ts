import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json();
    // Strictly pulling from environment variable for maximum security
    const ADMIN_KEY = process.env.KEY_ADMIN;

    if (!ADMIN_KEY) {
      console.error("CRITICAL SECURITY ERROR: KEY_ADMIN is not defined in environment variables.");
      return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
    }
    
    // Compare provided key with the environment variable
    if (key === ADMIN_KEY) {
      const response = NextResponse.json({ 
        success: true,
        message: 'Authentication successful'
      });
      
      // Setting a secure HTTP-only cookie for session management
      response.cookies.set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 12, // 12 Hours session duration
        path: '/',
      });
      
      return response;
    }

    return NextResponse.json({ message: 'Invalid Admin Authorization Key' }, { status: 401 });
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ message: 'An internal error occurred' }, { status: 500 });
  }
}