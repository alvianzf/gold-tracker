import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  // Extract path
  const { pathname } = request.nextUrl;

  // Unprotected Routes
  const isPublicRoute = 
    pathname.startsWith('/login') || 
    pathname.startsWith('/register') || 
    pathname.startsWith('/_next') || 
    pathname.includes('.') || 
    pathname === '/api/scrape' ||
    pathname === '/api/fix-prices';
    
  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (pathname === '/api/auth/login' || pathname === '/api/auth/register') {
    return NextResponse.next();
  }

  // Check for the session cookie
  const sessionToken = request.cookies.get('session-token')?.value;

  // Verify the JWT is valid
  const payload = sessionToken ? await verifyToken(sessionToken) : null;

  if (!payload) {
    // API routes return 401 Unauthorized
    if (pathname.startsWith('/api/')) {
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
  matcher: ['/((?!api/auth/login|_next/static|_next/image|favicon.ico).*)'],
};
