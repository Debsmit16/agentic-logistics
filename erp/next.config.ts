import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/electron-wrapper.zip",
        destination: "/api/download",
      },
    ];
  },
};

export default nextConfig;
