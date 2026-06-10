import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isInternal =
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png';

  if (isInternal) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session-token')?.value;
  const payload = sessionToken ? await verifyToken(sessionToken) : null;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isLandingPage = pathname === '/';

  if (payload) {
    if (isAuthRoute || isLandingPage) {
      return NextResponse.redirect(new URL('/gold', request.url));
    }
  } else {
    if (isLandingPage || isAuthRoute) {
      return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
      const isPublicApi =
        pathname === '/api/auth/login' ||
        pathname === '/api/auth/register' ||
        pathname === '/api/prices/latest' ||
        pathname === '/api/prices/ticker' ||
        pathname === '/api/prices/history';
      if (isPublicApi) return NextResponse.next();

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', encodeURI(request.nextUrl.pathname));
    return NextResponse.redirect(loginUrl);
  }

  // Forward verified user info to API routes via request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload!.id as string);
  requestHeaders.set('x-user-role', payload!.role as string);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
