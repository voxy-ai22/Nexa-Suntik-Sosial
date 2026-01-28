import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the admin_auth cookie explicitly with path /
  response.cookies.set('admin_auth', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Set expiry to epoch
    path: '/',
  });
  
  return response;
}