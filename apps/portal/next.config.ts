import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Turbopack (Next.js 16 默认)
  experimental: {
    // typedRoutes: true,
  },

  // 图片域名白名单
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.110.246',
        port: '9000',
        pathname: '/crmall0125/**',
      },
    ],
  },

  // 转译 monorepo 内部包
  transpilePackages: ['@twcrm/db', '@twcrm/shared', '@twcrm/ui'],

  // Standalone 输出（Docker 部署用）
  output: 'standalone',
}

export default withNextIntl(nextConfig)
