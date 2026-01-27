import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminArea = path.startsWith('/admin') && path !== '/admin/login';
  const authCookie = request.cookies.get('admin_auth')?.value;

  if (isAdminArea && authCookie !== 'true') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}