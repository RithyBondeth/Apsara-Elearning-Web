import { proxyIdentityHeaders } from "@/lib/api/proxy-headers"

/**
 * Rotates a refresh token from middleware.
 *
 * `refresh.ts` does the same for route handlers, but through `next/headers`
 * cookies, which middleware can't use — middleware reads cookies off the
 * request and writes them onto its response. Returns null on any failure
 * (expired, already rotated by a concurrent request, gateway down); the
 * caller then carries on exactly as it would have without renewal.
 */
const GATEWAY_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL

export interface IRenewedSession {
  accessToken: string
  refreshToken: string
}

export async function renewSession(
  refreshToken: string,
  incoming: { get(name: string): string | null }
): Promise<IRenewedSession | null> {
  if (!GATEWAY_URL) return null
  try {
    const res = await fetch(`${GATEWAY_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(await proxyIdentityHeaders(incoming)),
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
    if (!res.ok) return null
    const data = (await res.json()) as Partial<IRenewedSession>
    return data.accessToken && data.refreshToken
      ? { accessToken: data.accessToken, refreshToken: data.refreshToken }
      : null
  } catch {
    return null
  }
}
