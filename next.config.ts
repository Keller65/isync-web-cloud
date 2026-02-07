import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    externalDir: true,
  },
  allowedDevOrigins: ["*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-266f56f2e24d4d3b8e8abdb612029f2f.r2.dev",
      },
      {
        protocol: "https",
        hostname: "fonts.googleapis.com",
      },
    ],
  },
  async rewrites() {
    const apiHost = process.env.NEXT_PUBLIC_API_HOST
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiHost}/:path*`,
      },
    ]
  },
};

export default nextConfig;