import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev",
      },
    ],
  },
  async rewrites() {
    const apiHost = process.env.API_HOST
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiHost}/:path*`,
      },
    ]
  },
};

export default nextConfig;