import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected admin routes with role requirements
const ADMIN_PROTECTED_ROUTES = [
  { path: '/admin/dashboard', roles: ['admin', 'superadmin'] },
  { path: '/admin/quizzes', roles: ['admin', 'superadmin'] },
  { path: '/admin/profile', roles: ['admin', 'superadmin'] },
  { path: '/admin/users', roles: ['superadmin'] }, // Superadmin only
  { path: '/admin/assignments', roles: ['superadmin'] }, // Superadmin only
  { path: '/admin/config', roles: ['superadmin'] }, // Superadmin only
];

// Helper function to check if user has access to a route
function hasRouteAccess(pathname: string, userRole: string): boolean {
  const route = ADMIN_PROTECTED_ROUTES.find(route => pathname.startsWith(route.path));
  if (!route) return true; // Allow access to routes not explicitly protected
  
  return route.roles.includes(userRole);
}

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/admin/login',
  '/q', // Public quiz routes
];

// Get backend URL from environment or fallback
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Helper function to verify JWT token and get user info by calling backend API
async function validateTokenAndGetUser(token: string): Promise<{ isValid: boolean; user?: any }> {
  if (!token) return { isValid: false };
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { isValid: false };
    }

    const result = await response.json();
    
    // Check standardized API response format
    if (result.success === true && result.data && result.data.id) {
      return { isValid: true, user: result.data };
    }
    
    return { isValid: false };
  } catch (error) {
    console.error('Token validation error:', error);
    return { isValid: false };
  }
}

// Helper function for backward compatibility
async function isValidToken(token: string): Promise<boolean> {
  const result = await validateTokenAndGetUser(token);
  return result.isValid;
}

// Helper function to refresh token if expired
async function refreshToken(refreshToken: string): Promise<string | null> {
  if (!refreshToken) return null;
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    
    // Check standardized API response format
    if (result.success && result.data) {
      return result.data.access_token || result.data.token;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log(`Middleware processing: ${pathname}`);
  
  // Check if the route is admin protected
  const isAdminProtected = ADMIN_PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route.path)
  );
  
  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(route)
  );
  
  // Get authentication token from multiple sources
  const token = getTokenFromRequest(request);
  const refreshTokenValue = getRefreshTokenFromRequest(request);
  
  console.log(`Route: ${pathname}, Protected: ${isAdminProtected}, Token exists: ${!!token}`);
  
  // Special handling for /admin root - redirect based on authentication
  if (pathname === '/admin') {
    if (token) {
      const isTokenValid = await isValidToken(token);
      if (isTokenValid) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // If accessing a protected admin route, validate token and check role
  if (isAdminProtected) {
    let validToken = token;
    let tokenValidation: { isValid: boolean; user?: any } = { isValid: false };
    
    if (token) {
      tokenValidation = await validateTokenAndGetUser(token);
    }
    
    // If token is invalid, try to refresh it
    if (!tokenValidation.isValid && refreshTokenValue) {
      console.log('Token invalid, attempting refresh...');
      const newToken = await refreshToken(refreshTokenValue);
      if (newToken) {
        console.log('Token refreshed successfully');
        validToken = newToken;
        tokenValidation = await validateTokenAndGetUser(newToken);
        
        // Set new token in response if valid
        if (tokenValidation.isValid) {
          const response = NextResponse.next();
          response.cookies.set('admin_token', newToken, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60, // 24 hours
          });
          
          // Continue with role check below
          if (!hasRouteAccess(pathname, tokenValidation.user?.role)) {
            console.log(`Access denied: User role '${tokenValidation.user?.role}' not allowed for ${pathname}`);
            const response = NextResponse.redirect(new URL('/admin/dashboard', request.url));
            response.cookies.set('admin_error', 'You do not have permission to access this page', {
              maxAge: 10, // Short-lived error message
            });
            return response;
          }
          
          return response;
        }
      }
    }
    
    // If still no valid token, redirect to login
    if (!tokenValidation.isValid) {
      console.log(`Redirecting to login from ${pathname}`);
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      // Clear invalid tokens from cookies
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('admin_token');
      response.cookies.delete('admin_refresh_token');
      
      return response;
    }
    
    // Check role-based access for valid token
    if (tokenValidation.user && !hasRouteAccess(pathname, tokenValidation.user.role)) {
      console.log(`Access denied: User role '${tokenValidation.user.role}' not allowed for ${pathname}`);
      const response = NextResponse.redirect(new URL('/admin/dashboard', request.url));
      response.cookies.set('admin_error', 'You do not have permission to access this page', {
        maxAge: 10, // Short-lived error message
      });
      return response;
    }
  }
  
  // If already logged in with valid token and trying to access login page, redirect to dashboard
  if (pathname === '/admin/login' && token) {
    const isTokenValid = await isValidToken(token);
    if (isTokenValid) {
      console.log('Redirecting authenticated user from login to dashboard');
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/admin/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }
  
  // Allow request to proceed
  return NextResponse.next();
}

// Helper function to extract token from request
function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get from localStorage (client-side) via cookie sync
  let token = request.cookies.get('admin_token')?.value;
  
  // Try to get from Authorization header
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  return token || null;
}

// Helper function to extract refresh token from request
function getRefreshTokenFromRequest(request: NextRequest): string | null {
  return request.cookies.get('admin_refresh_token')?.value || null;
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};