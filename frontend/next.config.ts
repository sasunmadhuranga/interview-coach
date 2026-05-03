import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://interview-alb-1315898996.us-east-1.elb.amazonaws.com/api/:path*',
      },
    ]
  },
}

export default nextConfig;
