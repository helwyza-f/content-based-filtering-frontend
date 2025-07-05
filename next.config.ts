import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.myntassets.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "assets.myntassets.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/photos/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        port: "",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "jkcfkwigybhsxjitbopz.supabase.co",
      },
    ],
  },
};

export default nextConfig;
