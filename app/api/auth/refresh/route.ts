import { NextResponse } from "next/server"
import { refreshSession } from "@/lib/auth/refresh"

/**
 * Rotates the token pair. The gateway invalidates the old refresh token on every
 * successful call (token.service.ts), so a failure means the session is genuinely
 * dead — `refreshSession` clears the cookies rather than leave stale ones behind.
 */
export async function POST() {
  const accessToken = await refreshSession()

  if (!accessToken) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 })
  }

  return NextResponse.json({ ok: true })
}
