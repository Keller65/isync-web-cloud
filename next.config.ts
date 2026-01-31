import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api-proxy/:path*',
        destination: 'http://200.115.188.54:4325/:path*',
      },
    ]
  },
};

export default nextConfig;
