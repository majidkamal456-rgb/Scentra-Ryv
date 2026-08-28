import type { NextConfig } from "next";
import path from "path";

const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "scentraryv.pk",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "www.scentraryv.pk",
        pathname: "/media/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: apiHost,
  },
};

export default nextConfig;
