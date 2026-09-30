/**
 * Session cookie attributes, shared by `session.ts` (route handlers) and the
 * middleware's session renewal — both must write byte-identical cookies, and
 * `session.ts` is `server-only`, which middleware can't import.
 */

/** Cookie lifetimes (the gateway's own token expiry is enforced separately). */
export const ACCESS_MAX_AGE = 60 * 60 * 24
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7

export const SESSION_COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  /* Secure breaks plain-http localhost, so it tracks NODE_ENV. */
  secure: process.env.NODE_ENV === "production",
  priority: "high",
} as const
