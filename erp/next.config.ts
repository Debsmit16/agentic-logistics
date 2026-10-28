import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    agentUpgrade: "security" as any,
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
