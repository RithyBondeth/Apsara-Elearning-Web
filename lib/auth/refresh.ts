import "server-only"

import { callGateway } from "@/lib/auth/gateway"
import {
  clearSessionCookies,
  getRefreshToken,
  setSessionCookies,
  type ISessionTokens,
} from "@/lib/auth/session"

/**
 * Rotates the token pair in place and returns the new access token, or null if
 * the session is dead (in which case the cookies are cleared).
 *
 * Shared by the `/api/auth/refresh` route and the API proxy, so a 401 mid-request
 * can be recovered without a round-trip back through the browser.
 */
export async function refreshSession({
  clearOnFailure = true,
}: { clearOnFailure?: boolean } = {}): Promise<string | null> {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) return null

  const result = await callGateway<ISessionTokens>("/auth/refresh", {
    body: { refreshToken },
  })

  if (!result.ok || !result.data) {
    if (clearOnFailure) await clearSessionCookies()
    return null
  }

  await setSessionCookies(result.data)
  return result.data.accessToken
}
