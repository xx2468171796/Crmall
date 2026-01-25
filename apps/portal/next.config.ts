import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@nexus/ui",
    "@nexus/db",
    "@nexus/auth",
    "@nexus/rbac",
    "@nexus/redis",
    "@nexus/storage",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
}

export default nextConfig
