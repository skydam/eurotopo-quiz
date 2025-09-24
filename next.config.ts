import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true
  },
  // Optimize for static export and better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  },
  // Fix workspace root warning
  outputFileTracingRoot: '/Users/backupadmin/Library/CloudStorage/OneDrive-Personal/EuroTopo/eurotopo-quiz',
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
