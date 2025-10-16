import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    // NEXT_PUBLIC_API_URL: "http://localhost:3000"
    NEXT_PUBLIC_API_URL: "https://ottapp.ecm.mn/api",

  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'skuul.mn',
        port: '',
        pathname: '/Files/**',
      },
    ],
  },
};

export default nextConfig;