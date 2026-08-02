/**
 * Cookie names live here rather than in `session.ts` because that module is
 * `server-only` — middleware and the isomorphic API client need the names
 * without pulling in the server-only cookie helpers.
 *
 * Follows the existing `apsara-elearning-*` cookie/storage convention.
 */
const prefix = process.env.NODE_ENV === "production" ? "__Host-" : ""

export const ACCESS_COOKIE = `${prefix}apsara-elearning-access`
export const REFRESH_COOKIE = `${prefix}apsara-elearning-refresh`
