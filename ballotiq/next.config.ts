import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  trailingSlash: true,
  // Prevent Next/Turbopack from guessing the wrong workspace root
  // when multiple `package-lock.json` files exist in the monorepo.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
  output: 'standalone',
};

export default nextConfig;
