export interface OAuthMetadata {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint?: string;
  end_session_endpoint?: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000;
const metadataCache = new Map<string, { metadata: OAuthMetadata; expiresAt: number }>();

function buildMetadata(data: Record<string, string>): OAuthMetadata | null {
  if (!data.authorization_endpoint || !data.token_endpoint) return null;
  return {
    issuer: data.issuer,
    authorization_endpoint: data.authorization_endpoint,
    token_endpoint: data.token_endpoint,
    revocation_endpoint: data.revocation_endpoint,
    end_session_endpoint: data.end_session_endpoint,
  };
}

export async function discoverOAuth(serverUrl: string): Promise<OAuthMetadata | null> {
  const cached = metadataCache.get(serverUrl);
  if (cached && cached.expiresAt > Date.now()) return cached.metadata;
  if (cached) metadataCache.delete(serverUrl);

  // In the browser, Stalwart doesn't send CORS headers — proxy through Next.js API.
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/auth/discovery?issuer=${encodeURIComponent(serverUrl)}`);
      if (!res.ok) return null;
      const data = await res.json();
      const metadata = buildMetadata(data);
      if (metadata) {
        metadataCache.set(serverUrl, { metadata, expiresAt: Date.now() + CACHE_TTL_MS });
      }
      return metadata;
    } catch {
      return null;
    }
  }

  const urls = [
    `${serverUrl}/.well-known/oauth-authorization-server`,
    `${serverUrl}/.well-known/openid-configuration`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      const metadata = buildMetadata(data);
      if (metadata) {
        metadataCache.set(serverUrl, { metadata, expiresAt: Date.now() + CACHE_TTL_MS });
        return metadata;
      }
    } catch {
      continue;
    }
  }

  return null;
}
