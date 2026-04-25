import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

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

async function proxyToStalwart(request: NextRequest): Promise<NextResponse> {
  const targetUrl = `${STALWART_URL}${request.nextUrl.pathname}${request.nextUrl.search}`;

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

  // Rewrite Stalwart redirects (e.g. /.well-known/jmap → /jmap/session)
  // to keep requests on the local proxy origin
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
  const origin = request.headers.get('origin');
  if (origin) {
    responseHeaders.set('Access-Control-Allow-Origin', origin);
    responseHeaders.set('Access-Control-Allow-Credentials', 'true');
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CORS preflight for JMAP paths
  if (request.method === 'OPTIONS' && isJmapPath(pathname)) {
    const origin = request.headers.get('origin') || '';
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
      },
    });
  }

  // Proxy JMAP paths to Stalwart server-side (avoids browser CORS restrictions)
  if (STALWART_URL && isJmapPath(pathname)) {
    try {
      return await proxyToStalwart(request);
    } catch (err) {
      console.error('[jmap-proxy] error:', err);
      return NextResponse.json({ error: 'Proxy error' }, { status: 502 });
    }
  }

  // All other requests: security headers + i18n routing
  const nonce = crypto.randomUUID();
  const isDev = process.env.NODE_ENV === "development";

  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}'`;

  const connectSrc = isDev ? `'self' https: ws: wss:` : `'self' https:`;

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self'`,
    `connect-src ${connectSrc}`,
    `frame-src 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ].join("; ");

  let intlResponse: ReturnType<typeof intlMiddleware> | null = null;
  try {
    intlResponse = intlMiddleware(request);
  } catch (error) {
    console.error('Locale middleware error:', error);
  }
  const response = intlResponse ?? NextResponse.next();

  const existing = response.headers.get("x-middleware-override-headers");
  response.headers.set(
    "x-middleware-override-headers",
    existing ? `${existing},x-nonce` : "x-nonce"
  );
  response.headers.set("x-middleware-request-x-nonce", nonce);

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "0");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  response.headers.set("Content-Security-Policy-Report-Only", csp);

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
    "/.well-known/jmap",
    "/jmap/:path*",
    "/download/:path*",
    "/upload/:path*",
    "/events",
  ],
};
