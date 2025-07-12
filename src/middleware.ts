import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // List of public routes that don't require authentication
  const publicRoutes = ['/auth', '/auth/callback'];
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth', req.url));
  }

  // If user is authenticated and trying to access auth page, redirect to home
  if (session && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.json$|.*\\.js$).*)'],
};