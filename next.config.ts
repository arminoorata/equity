import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project to avoid the
  // "multiple lockfiles" warning when /srv has its own package-lock.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
