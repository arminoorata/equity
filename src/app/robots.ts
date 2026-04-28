import type { MetadataRoute } from "next";

/**
 * robots.txt generator. Allow everything by default. The portal is
 * fully public: every tab is educational, no auth gates, no private
 * routes, no state-dependent results pages.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: "https://equity.arminoorata.com/sitemap.xml",
  };
}
