import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // The dashboard is opened at 127.0.0.1:3100 during local browser testing.
  allowedDevOrigins: ['127.0.0.1'],

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    const backendOrigin = (process.env.BACKEND_INTERNAL_URL || 'http://ihhxbfmr3be3hilklfuvhwyg.203.96.190.78.sslip.io').replace(/\/$/, '');
    return [
      {
        source: '/uploads/:path*',
        destination: `${backendOrigin}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
