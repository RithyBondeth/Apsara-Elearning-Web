/**
 * Whether an access token is present and not yet expired, read from its own
 * `exp` claim. No signature check — the gateway does that; this only decides
 * whether a 401 could be about the session at all.
 *
 * The proxies use it to avoid a pointless refresh-and-retry: when a live
 * token gets a 401, the endpoint itself refused the request (e.g. "Password
 * is incorrect" on account deletion or change-password), and retrying would
 * only repeat that refusal — and spend a second attempt against the
 * endpoint's rate limit.
 */
const EXPIRY_MARGIN_MS = 5_000

export function isAccessTokenLive(
  token: string | null | undefined,
  now: number = Date.now()
): boolean {
  if (!token) return false
  const payload = token.split(".")[1]
  if (!payload) return false
  try {
    const json = JSON.parse(
      Buffer.from(
        payload.replace(/-/g, "+").replace(/_/g, "/"),
        "base64"
      ).toString("utf8")
    ) as { exp?: unknown }
    return (
      typeof json.exp === "number" && json.exp * 1000 > now + EXPIRY_MARGIN_MS
    )
  } catch {
    return false
  }
}
