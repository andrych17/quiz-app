import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  console.log('🔥 MIDDLEWARE HIT:', request.method, request.nextUrl.pathname);
  
  const { pathname } = request.nextUrl;
  
  // Let everything through but log it
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
};