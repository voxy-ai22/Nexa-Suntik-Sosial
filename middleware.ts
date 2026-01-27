
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Simple pass through, authentication is handled in API and Client side
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
