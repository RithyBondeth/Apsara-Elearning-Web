import type { MetadataRoute } from "next"
import { isIndexable, siteUrl } from "@/lib/site-url"

/**
 * Crawlers may read the public pages (landing, catalog, course pages, legal,
 * certificate verification). Signed-in areas, admin, the API proxies and
 * token-carrying auth links are off limits. Preview deployments disallow
 * everything so they never compete with the real site in search results.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) {
    return { rules: { userAgent: "*", disallow: "/" } }
  }
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin",
        "/dashboard",
        "/learn",
        "/profile",
        "/tutor",
        "/certificates",
        "/leaderboard",
        "/activity",
        "/billing",
        "/reset-password",
        "/verify-email",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
