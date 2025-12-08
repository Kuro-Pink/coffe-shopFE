import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  if (pathname.startsWith('/menu') || pathname === '/login') {
    return NextResponse.next();
  }

  // Protected routes - yêu cầu authentication
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/host'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};