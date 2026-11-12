import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/logo.png') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/maintenance')
  ) {
    return NextResponse.next();
  }

  // Allow test domain or bypass parameter to access the full admin dashboard
  if (host.includes('test-admin') || request.nextUrl.searchParams.has('bypass_maintenance')) {
    return NextResponse.next();
  }

  const bypassCookie = request.cookies.get('gw_bypass_maintenance');
  if (bypassCookie?.value === 'true') {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/maintenance';
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
