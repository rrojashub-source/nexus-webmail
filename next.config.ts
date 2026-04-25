import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const stalwartUrl = process.env.JMAP_SERVER_URL || '';

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: import.meta.dirname,
  },
  // Proxy JMAP paths to Stalwart server-side to avoid CORS restrictions.
  // The browser JMAP client connects to localhost, Next.js forwards to Stalwart.
  async rewrites() {
    if (!stalwartUrl) return [];
    return [
      { source: '/.well-known/jmap', destination: `${stalwartUrl}/.well-known/jmap` },
      { source: '/jmap/session',      destination: `${stalwartUrl}/jmap/session` },
      { source: '/jmap',              destination: `${stalwartUrl}/jmap` },
      { source: '/download/:path*',   destination: `${stalwartUrl}/download/:path*` },
      { source: '/upload/:path*',     destination: `${stalwartUrl}/upload/:path*` },
      { source: '/events',            destination: `${stalwartUrl}/events` },
    ];
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
