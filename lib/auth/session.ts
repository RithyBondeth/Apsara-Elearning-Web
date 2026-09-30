import "server-only"

import { cookies } from "next/headers"

import { ACCESS_COOKIE, REFRESH_COOKIE } from "./cookie-names"
import {
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  SESSION_COOKIE_BASE as baseCookie,
} from "./cookie-options"

/**
 * Session cookies are written only by the BFF route handlers under `app/api/auth`.
 * They are httpOnly, so nothing in the browser bundle can read them — the refresh
 * token in particular never becomes reachable from JS.
 */
export { ACCESS_COOKIE, REFRESH_COOKIE }

export interface ISessionTokens {
  accessToken: string
  refreshToken: string
}

/** Persist a freshly issued token pair. Called after login, register and refresh. */
export async function setSessionCookies({
  accessToken,
  refreshToken,
}: ISessionTokens) {
  const jar = await cookies()
  jar.set(ACCESS_COOKIE, accessToken, { ...baseCookie, maxAge: ACCESS_MAX_AGE })
  jar.set(REFRESH_COOKIE, refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  })
}

export async function clearSessionCookies() {
  const jar = await cookies()
  jar.delete(ACCESS_COOKIE)
  jar.delete(REFRESH_COOKIE)
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value ?? null
}

export async function getRefreshToken() {
  return (await cookies()).get(REFRESH_COOKIE)?.value ?? null
}
