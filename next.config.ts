import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bcryptjs', '@prisma/client'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
