import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/book',
  eslint: {
    ignoreDuringBuilds: true
  }
  
  /* config options here */
};

export default nextConfig;
