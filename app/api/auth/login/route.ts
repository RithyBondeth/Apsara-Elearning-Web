import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"
import { setSessionCookies, type ISessionTokens } from "@/lib/auth/session"

/**
 * Exchanges credentials for a session. The token pair from the gateway is
 * written straight into httpOnly cookies and never returned in the body —
 * that is the whole point of routing login through the BFF.
 */
export async function POST(request: Request) {
  const credentials = await request.json()

  const result = await callGateway<ISessionTokens>("/auth/login", {
    body: credentials,
  })

  if (!result.ok || !result.data) {
    return NextResponse.json(
      {
        message: result.message,
        /* The gateway returns 403 'Email not verified' for unverified accounts;
           the login form keys its resend prompt off this flag. */
        emailNotVerified: result.status === 403,
      },
      { status: result.status }
    )
  }

  await setSessionCookies(result.data)
  return NextResponse.json({ ok: true })
}
