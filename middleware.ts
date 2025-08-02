import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWTAuth } from '@/lib/auth/jwt';

// Define public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/api/auth/verify-email',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
];

// Define protected API paths
const protectedApiPaths = [
  '/api/dashboard',
  '/api/user',
  '/api/watchlists',
  '/api/alerts',
];

// Define protected page paths
const protectedPagePaths = [
  '/dashboard',
  '/profile',
  '/settings',
  '/watchlists',
  '/alerts',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next();
  }

  // Check if path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // Check if path is protected
  const isProtectedApiPath = protectedApiPaths.some(path => 
    pathname.startsWith(path)
  );
  const isProtectedPagePath = protectedPagePaths.some(path => 
    pathname === path || pathname.startsWith(path + '/')
  );

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get access token from cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  // If no token, redirect to login or return unauthorized
  if (!accessToken) {
    if (isProtectedApiPath) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    if (isProtectedPagePath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    return NextResponse.next();
  }

  // Verify token
  const payload = await JWTAuth.verifyAccessToken(accessToken);
  
  if (!payload) {
    // Token is invalid
    if (isProtectedApiPath) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    if (isProtectedPagePath) {
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('access_token');
      response.cookies.delete('refresh_token');
      return response;
    }
  }

  // Token is valid, add user info to headers for API routes
  if (isProtectedApiPath && payload) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);
    requestHeaders.set('x-user-role', payload.role || 'user');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // For authenticated users trying to access login/register, redirect to dashboard
  if (payload && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
