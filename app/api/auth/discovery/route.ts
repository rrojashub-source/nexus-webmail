import { NextResponse } from 'next/server';
import { discoverOAuth } from '@/lib/oauth/discovery';

// Browser can't fetch Stalwart's well-known directly (no CORS headers).
// This route proxies the discovery server-side and returns it to the client.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const issuer = searchParams.get('issuer');

  if (!issuer) {
    return NextResponse.json({ error: 'Missing issuer parameter' }, { status: 400 });
  }

  const metadata = await discoverOAuth(issuer);

  if (!metadata) {
    return NextResponse.json({ error: 'OAuth discovery failed' }, { status: 502 });
  }

  return NextResponse.json(metadata);
}
