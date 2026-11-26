export function getPublicSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_PREVIEW_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    if (/^gw-admin\./i.test(hostname)) {
      return `${protocol}//${hostname.replace(/^gw-admin\./i, 'gw-site.')}`;
    }
    return `${protocol}//${hostname.replace(/^admin\./i, '')}`;
  }
  return 'https://geospatialworks.com.bd';
}
