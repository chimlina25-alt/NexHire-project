// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createHash } from 'crypto';

function hashText(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

const protectedEmployerRoutes = [
  '/dashboard',
  '/post_job',
  '/employer_message',
  '/employer_notification',
  '/employer_profile',
  '/employer_setting',
  '/subscription',
];

const protectedJobSeekerRoutes = [
  '/home_page',
  '/profile',
  '/job_seeker_message',
  '/job_seeker_notification',
  '/job_seeker_setting',
];

const publicRoutes = [
  '/login',
  '/signup',
  '/forgot_password',
  '/reset_password',
  '/reset_password_success',
  '/verify',
  '/role_choosing',
  '/employer',
  '/job_seeker',
  '/google-callback',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public routes and API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  const isProtectedEmployerRoute = protectedEmployerRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );

  const isProtectedJobSeekerRoute = protectedJobSeekerRoutes.some(
    route => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedEmployerRoute && !isProtectedJobSeekerRoute) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session_token')?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate session by calling the database via edge-compatible fetch
  try {
    const baseUrl = request.nextUrl.origin;
    const validateRes = await fetch(`${baseUrl}/api/auth/validate-session`, {
      method: 'GET',
      headers: {
        cookie: `session_token=${sessionToken}`,
      },
      cache: 'no-store',
    });

    if (!validateRes.ok) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const data = await validateRes.json();
    const user = data.user;

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Job seeker trying to access employer routes
    if (isProtectedEmployerRoute && user.role !== 'employer') {
      return NextResponse.redirect(new URL('/home_page', request.url));
    }

    // Employer trying to access job seeker routes
    if (isProtectedJobSeekerRoute && user.role !== 'job_seeker') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error('MIDDLEWARE ERROR:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/post_job',
    '/post_job/:path*',
    '/employer_message',
    '/employer_message/:path*',
    '/employer_notification',
    '/employer_notification/:path*',
    '/employer_profile',
    '/employer_profile/:path*',
    '/employer_setting',
    '/employer_setting/:path*',
    '/subscription',
    '/subscription/:path*',
    '/home_page',
    '/home_page/:path*',
    '/profile',
    '/profile/:path*',
    '/job_seeker_message',
    '/job_seeker_message/:path*',
    '/job_seeker_notification',
    '/job_seeker_notification/:path*',
    '/job_seeker_setting',
    '/job_seeker_setting/:path*',
  ],
};