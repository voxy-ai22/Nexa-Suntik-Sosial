import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Proteksi semua path /admin kecuali halaman login
  const isAdminArea = path.startsWith('/admin') && path !== '/admin/login';
  const authCookie = request.cookies.get('admin_auth')?.value;

  if (isAdminArea && authCookie !== 'true') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // Jika sudah login tapi akses halaman login, buang ke dashboard
  if (path === '/admin/login' && authCookie === 'true') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
}