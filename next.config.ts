import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'judy-noncontributory-waywardly.ngrok-free.dev',
    'localhost',
    '127.0.0.1'
  ],
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=60',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  experimental: {
    optimizePackageImports: ['@/lib'],
    fallbackNodePolyfills: false,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

// ✅ Použijeme require místo import - vyhne se typovým konfliktům
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
})

export default withPWA(nextConfig)