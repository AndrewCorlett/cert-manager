import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Check if Supabase environment variables are configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured');
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            request.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          remove(name: string, _options: CookieOptions) {
            request.cookies.delete(name);
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            response.cookies.delete(name);
          },
        },
      }
    );

    // Get user session
    const { data: { user } } = await supabase.auth.getUser();

    // List of public routes that don't require authentication
    const publicRoutes = ['/auth', '/auth/callback'];
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    // If user is not authenticated and trying to access protected route
    if (!user && !isPublicRoute) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // If user is authenticated and trying to access auth page, redirect to home
    if (user && request.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow access but log the issue
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (PWA manifest)
     * - icon files (PWA icons)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\.png|api/).*)',
  ],
};