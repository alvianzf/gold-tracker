import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  // Extract path
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js routes are always public
  const isInternal = 
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname === '/favicon.ico' ||
    pathname === '/icon.png';
    
  if (isInternal) {
    return NextResponse.next();
  }

  // Check for the session cookie
  const sessionToken = request.cookies.get('session-token')?.value;

  // Verify the JWT is valid
  const payload = sessionToken ? await verifyToken(sessionToken) : null;

  // Auth Group: Login, Register, and the Landing Page (/)
  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';

  if (payload) {
    // If logged in, don't show landing, login, or register. Send to dashboard.
    if (isAuthRoute || isLandingPage) {
      return NextResponse.redirect(new URL('/gold', request.url));
    }
  } else {
    // If NOT logged in, allow landing page and auth routes
    if (isLandingPage || isAuthRoute) {
      return NextResponse.next();
    }
    
    // API routes return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
      // Allow specific public API routes
      const isPublicApi = pathname === '/api/auth/login' || 
                         pathname === '/api/auth/register' ||
                         pathname === '/api/scrape' ||
                         pathname === '/api/fix-prices';
      if (isPublicApi) return NextResponse.next();
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Front-end routes redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(loginUrl);
  }

  // Inject user info into headers so API routes can easily read them without parsing the JWT again
  const response = NextResponse.next();
  response.headers.set('x-user-id', payload.id as string);
  response.headers.set('x-user-role', payload.role as string);

  return response;
}

export const config = {
  matcher: ['/((?!api/some-exempt-route|favicon.ico).*)'],
};
