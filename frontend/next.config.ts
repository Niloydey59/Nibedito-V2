// filepath: next.config.ts
import type { NextConfig } from 'next';
import NextRemoveImports from 'next-remove-imports';

const removeImports = NextRemoveImports();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/dzrgyxroo/**',
      },
      {
        protocol: 'https',
        hostname: 'render.com',
        pathname: '/**',
      },
    ],
    domains: ['res.cloudinary.com'],
    unoptimized: true,
  },
};

export default removeImports(nextConfig);