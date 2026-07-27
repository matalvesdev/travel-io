import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/forgot', '/auth/callback'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.some(route => pathname === route)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico).*)',
  ],
};
