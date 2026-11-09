import type { NextConfig } from 'next';
import path from 'path';

const apiInternalUrl = process.env.BACKEND_INTERNAL_URL || 'https://gw-api.203.96.190.78.sslip.io';

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
        destination: 'http://localhost:3000/api/revalidate',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://localhost:3000/uploads/:path*',
      },
    ];
  },
};

export default nextConfig;
