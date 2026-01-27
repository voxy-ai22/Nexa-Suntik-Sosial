import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath = path.startsWith('/admin/dashboard');
  const authCookie = request.cookies.get('admin_auth')?.value;

  if (isAdminPath && authCookie !== 'true') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (path === '/admin/login' && authCookie === 'true') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}