import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // ✅ Required for Amplify hosting
  },
};

export default nextConfig;
