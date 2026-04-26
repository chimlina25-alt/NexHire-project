// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedEmployerRoutes = [
  '/dashboard',
  '/employer',
  '/post_job',
  '/employer_message',
  '/employer_notification',
  '/employer_profile',
  '/employer_setting',
  '/subscription',
];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // Check if route is protected for employers
  const isProtectedEmployerRoute = protectedEmployerRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedEmployerRoute) {
    // Not logged in → redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in but wrong role → redirect to appropriate dashboard or login
    if (token.role !== 'EMPLOYER') {
      if (token.role === 'EMPLOYEE') {
        return NextResponse.redirect(new URL('/employee/dashboard', request.url));
      }
      if (token.role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/employer/:path*',
    '/post_job/:path*',
    '/employer_message/:path*',
    '/employer_notification/:path*',
    '/employer_profile/:path*',
    '/employer_setting/:path*',
    '/subscription/:path*',
  ],
};