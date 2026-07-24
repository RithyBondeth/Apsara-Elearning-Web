/**
 * Helpers for the post-auth `?next=` redirect destination.
 *
 * The value flows through the whole auth funnel: middleware sets it when it
 * bounces a signed-out user off a protected route, and it is carried across
 * login ⇄ register ⇄ verify-email so the user lands back where they started
 * once a session exists.
 *
 * Every consumer must run the raw value through `safeNext` before redirecting.
 * Only a same-origin *absolute path* is honored — this rejects absolute URLs
 * (`https://evil.com`) and protocol-relative URLs (`//evil.com`), both of which
 * would otherwise turn the login page into an open redirect.
 */

/** Query-string key used for the redirect destination throughout the auth flow. */
export const NEXT_PARAM = "next"

/** Returns the destination only when it is a safe same-origin path, else null. */
export function safeNext(next: string | null | undefined): string | null {
  if (!next) return null
  /* Must be an absolute path, but not a protocol-relative `//host` URL. */
  if (!next.startsWith("/") || next.startsWith("//")) return null
  return next
}

/**
 * Appends `next=…` to `path` when a safe destination is present, choosing `?`
 * or `&` depending on whether `path` already carries a query string.
 */
export function withNext(path: string, next: string | null | undefined): string {
  const safe = safeNext(next)
  if (!safe) return path
  const sep = path.includes("?") ? "&" : "?"
  return `${path}${sep}${NEXT_PARAM}=${encodeURIComponent(safe)}`
}
