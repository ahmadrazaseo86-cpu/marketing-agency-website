import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
const TOKEN_COOKIE_NAME = 'wp_admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

  // Protect all /wp-admin paths
  if (pathname.startsWith('/wp-admin')) {
    if (!token) {
      const loginUrl = new URL('/wp-login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already logged in and visiting /wp-login, redirect to /wp-admin
  if (pathname === '/wp-login') {
    if (token) {
      return NextResponse.redirect(new URL('/wp-admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/wp-admin/:path*', '/wp-login'],
};
