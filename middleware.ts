import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const STALWART_URL = process.env.JMAP_SERVER_URL || '';

const JMAP_PATHS = [
  '/.well-known/jmap',
  '/jmap/session',
  '/jmap',
  '/download/',
  '/upload/',
  '/events',
];

function isJmapPath(pathname: string): boolean {
  return JMAP_PATHS.some(p => pathname === p || pathname.startsWith(p));
}

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS preflight for JMAP paths
  if (request.method === 'OPTIONS' && isJmapPath(pathname)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
      },
    });
  }

  // Proxy JMAP paths to Stalwart server-side (avoids browser CORS restrictions)
  if (STALWART_URL && isJmapPath(pathname)) {
    const targetUrl = `${STALWART_URL}${request.nextUrl.pathname}${request.nextUrl.search}`;

    try {
      const headers = new Headers();
      request.headers.forEach((value, key) => {
        if (!['host', 'connection', 'transfer-encoding'].includes(key.toLowerCase())) {
          headers.set(key, value);
        }
      });
      headers.set('host', new URL(STALWART_URL).host);

      const body = ['GET', 'HEAD'].includes(request.method) ? undefined : request.body;

      const upstream = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        // @ts-expect-error -- duplex needed for streaming body
        duplex: 'half',
        redirect: 'manual',
      });

      // Rewrite redirect Location headers to stay on our proxy
      if (upstream.status >= 300 && upstream.status < 400) {
        const location = upstream.headers.get('location');
        if (location) {
          const rewritten = location.startsWith('http')
            ? request.nextUrl.origin + new URL(location).pathname
            : location;
          return NextResponse.redirect(new URL(rewritten, request.url), upstream.status);
        }
      }

      const responseHeaders = new Headers();
      upstream.headers.forEach((value, key) => {
        if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          responseHeaders.set(key, value);
        }
      });
      responseHeaders.set('Access-Control-Allow-Origin', request.headers.get('origin') || '*');
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch (err) {
      console.error('[jmap-proxy] error:', err);
      return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
    }
  }

  // All other requests go through next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!_next|.*\\..*).*)',
    '/.well-known/jmap',
    '/jmap/session',
    '/jmap',
    '/download/:path*',
    '/upload/:path*',
    '/events',
  ],
};
