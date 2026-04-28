import type { MetadataRoute } from "next";

const BASE = "https://equity.arminoorata.com";

/**
 * Sitemap — six tab routes, all public, no auth gates, no
 * state-dependent results pages.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes = [
    { path: "/", priority: 1 },
    { path: "/vesting", priority: 0.9 },
    { path: "/calculators", priority: 0.9 },
    { path: "/exercise", priority: 0.8 },
    { path: "/ask", priority: 0.8 },
    { path: "/glossary", priority: 0.8 },
  ];
  return routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
