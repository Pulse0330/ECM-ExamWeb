import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: "https://ottapp.ecm.mn/api",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "skuul.mn",
        port: "",
        pathname: "/**", // 👈 бүх зурагт зөвшөөрөл олгоно
      },
    ],
  },
};

export default nextConfig;
