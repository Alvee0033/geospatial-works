import type { NextConfig } from 'next';
import path from 'path';

const apiInternalUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';
const publicSiteInternalUrl =
  process.env.PUBLIC_SITE_INTERNAL_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'http://localhost:3000');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternalUrl}/api/v1/:path*`,
      },
      {
        source: '/site-revalidate',
        destination: `${publicSiteInternalUrl}/api/revalidate`,
      },
      {
        source: '/uploads/:path*',
        destination: `${publicSiteInternalUrl}/uploads/:path*`,
      },
      {
        source: '/projects-extracted/:path*',
        destination: `${publicSiteInternalUrl}/projects-extracted/:path*`,
      },
      {
        source: '/team-photos/:path*',
        destination: `${publicSiteInternalUrl}/team-photos/:path*`,
      },
      {
        source: '/real-media/:path*',
        destination: `${publicSiteInternalUrl}/real-media/:path*`,
      },
      {
        source: '/software-logos/:path*',
        destination: `${publicSiteInternalUrl}/software-logos/:path*`,
      },
    ];
  },
};

export default nextConfig;
