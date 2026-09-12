import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.18.15", "192.168.18.15:3000", "localhost:3000"],
};

export default nextConfig;
