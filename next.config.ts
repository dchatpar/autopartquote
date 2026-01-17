import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker deployment
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
