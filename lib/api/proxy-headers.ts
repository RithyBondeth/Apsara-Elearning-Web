/**
 * Headers that let the gateway rate-limit by the real browser rather than by
 * this server.
 *
 * Every browser call reaches the gateway through the BFF, so from the gateway's
 * side they all share one source IP. Left alone, one student loading a busy
 * page spends the whole platform's budget and the 5/min auth limits cap the
 * entire user base at 5 logins a minute. We therefore declare the browser's IP
 * explicitly and authenticate the claim with a shared secret — the gateway
 * ignores the header unless `INTERNAL_PROXY_SECRET` matches on both sides.
 *
 * Deliberately not marked `server-only`: `lib/api/client.ts` reaches this
 * through a dynamic import, and the bundler traces that into the client graph
 * even though the call sits behind a server-side branch. Nothing leaks —
 * `INTERNAL_PROXY_SECRET` has no `NEXT_PUBLIC_` prefix, so it is `undefined` in
 * the browser and this returns an empty header set.
 */
const CLIENT_IP_HEADER = "x-apsara-client-ip"
const PROXY_SECRET_HEADER = "x-apsara-proxy-secret"

/** Just enough of Headers to read from — `next/headers` returns a readonly variant. */
type TReadableHeaders = { get(name: string): string | null }

/** `x-forwarded-for` is a chain; the browser is the leftmost entry. */
function clientIpFrom(source: TReadableHeaders): string | null {
  const forwarded = source.get("x-forwarded-for")
  const first = forwarded?.split(",")[0]?.trim()
  if (first) return first
  return source.get("x-real-ip")?.trim() || null
}

/**
 * Builds the identity headers for one outbound gateway call. Pass the incoming
 * request's headers when you have them; otherwise they're read from the ambient
 * request via `next/headers`.
 */
export async function proxyIdentityHeaders(
  incoming?: TReadableHeaders
): Promise<Record<string, string>> {
  const secret = process.env.INTERNAL_PROXY_SECRET
  if (!secret) return {}

  let source = incoming
  if (!source) {
    const { headers } = await import("next/headers")
    source = await headers()
  }

  const clientIp = clientIpFrom(source)
  if (!clientIp) return {}

  return {
    [PROXY_SECRET_HEADER]: secret,
    [CLIENT_IP_HEADER]: clientIp,
  }
}
