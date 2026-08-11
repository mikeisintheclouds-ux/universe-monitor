import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "epic.gsfc.nasa.gov" },
      { protocol: "https", hostname: "gibs.earthdata.nasa.gov" },
      { protocol: "https", hostname: "gibs-a.earthdata.nasa.gov" },
      { protocol: "https", hostname: "gibs-b.earthdata.nasa.gov" },
      { protocol: "https", hostname: "gibs-c.earthdata.nasa.gov" },
    ],
  },
};

export default nextConfig;
