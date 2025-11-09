import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/admin/login',
    '/admin',
    '/q/',
    '/_next/',
    '/favicon.ico',
    '/api/',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Allow access to public paths
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for admin authentication for admin routes
  if (pathname.startsWith('/admin')) {
    const adminToken = request.cookies.get('admin_token')?.value ||
                      request.headers.get('authorization')?.replace('Bearer ', '');

    if (!adminToken) {
      // Redirect to login page if no token
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // TODO: Validate token with backend API
    // For now, just check if token exists
    // In production, you should validate the token with your backend
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};