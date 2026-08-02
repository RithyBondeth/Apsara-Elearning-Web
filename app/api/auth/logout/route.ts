import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"
import { clearSessionCookies, getRefreshToken } from "@/lib/auth/session"

/**
 * Tells the gateway to invalidate the refresh token itself, so logout still
 * revokes the server-side session when the short-lived access token has expired.
 * Local cookies are cleared even if the gateway is temporarily unreachable.
 */
export async function POST() {
  const refreshToken = await getRefreshToken()

  if (refreshToken) {
    await callGateway("/auth/logout", { body: { refreshToken } })
  }

  await clearSessionCookies()
  return NextResponse.json({ ok: true })
}
