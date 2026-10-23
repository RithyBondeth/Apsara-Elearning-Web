/**
 * The site's public origin, for absolute URLs (sitemap, robots, metadata).
 *
 * APP_ORIGIN is already set in production for the CSRF origin check in
 * proxy.ts; Vercel's production domain is the fallback, then local dev.
 */
export function siteUrl(): string {
  const configured = process.env.APP_ORIGIN?.replace(/\/$/, "")
  if (configured) return configured
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return "http://localhost:3000"
}

/** Only the production deployment should be indexed — never previews. */
export function isIndexable(): boolean {
  return (process.env.VERCEL_ENV ?? process.env.NODE_ENV) === "production"
}
