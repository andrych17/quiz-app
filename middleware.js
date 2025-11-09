import { NextResponse } from 'next/server'

export function middleware(request) {
  console.log('🔥 MIDDLEWARE WORKING:', request.nextUrl.pathname)
  
  const pathname = request.nextUrl.pathname
  const token = request.cookies.get('admin_token')?.value
  
  console.log('Path:', pathname, 'Has Token:', !!token)
  
  // Redirect authenticated users away from login page
  if (pathname === '/admin/login' && token) {
    console.log('Redirecting authenticated user away from login')
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/(.*)',
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ]
}
