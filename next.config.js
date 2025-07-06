/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'localhost', 
      'images.pexels.com', 
      'rsopyxqqwytaplsqoxgk.supabase.co'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rsopyxqqwytaplsqoxgk.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/**',
      }
    ],
    formats: ['image/webp'],
  },
  // Server Actions özelliğini etkinleştir
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
