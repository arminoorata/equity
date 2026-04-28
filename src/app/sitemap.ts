import type { MetadataRoute } from "next";
import { modules } from "@/data/modules";

const BASE = "https://equity.arminoorata.com";

/**
 * Sitemap. Six tab routes plus one detail page per Learn module so
 * the educational pages get indexed and are deep-linkable.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const tabs = [
    { path: "/", priority: 1 },
    { path: "/vesting", priority: 0.9 },
    { path: "/calculators", priority: 0.9 },
    { path: "/exercise", priority: 0.8 },
    { path: "/ask", priority: 0.8 },
    { path: "/glossary", priority: 0.8 },
  ];
  const moduleEntries = modules.map((m) => ({
    path: `/learn/${m.id}`,
    priority: 0.7,
  }));

  return [...tabs, ...moduleEntries].map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
