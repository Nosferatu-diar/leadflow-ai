import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    const privateHeaders = [
      { key: 'Cache-Control', value: 'private, no-store' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ];
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      { source: '/dashboard/:path*', headers: privateHeaders },
      { source: '/login/:path*', headers: privateHeaders },
      { source: '/api/:path*', headers: privateHeaders },
    ];
  },
};

export default nextConfig;
