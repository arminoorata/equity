import type { NextConfig } from "next";

/**
 * Content-Security-Policy is set per the security model in
 * spec/01-ARCHITECTURE.md. The Ask tab calls
 * generativelanguage.googleapis.com from the browser; that is the only
 * outbound origin we allow. Restricting connect-src and frame-ancestors
 * closes off the most common exfiltration paths if a malicious script
 * ever made it onto the page.
 */
const csp = [
  "default-src 'self'",
  // Next.js + Turbopack require inline + eval in the framework runtime.
  // Tighter values would break hydration. The vector this leaves open
  // is mitigated by trusting the dependency tree at build time.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  // next/font/google emits stylesheets from fonts.googleapis.com and
  // serves the actual font files from fonts.gstatic.com.
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  // The Ask tab is the only place we make a cross-origin call.
  "connect-src 'self' https://generativelanguage.googleapis.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project to avoid the
  // "multiple lockfiles" warning when /srv has its own package-lock.
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
