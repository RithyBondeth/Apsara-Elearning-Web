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

  const result = await callGateway<
    ISessionTokens & { deletionCancelled?: boolean }
  >("/auth/login", {
    body: credentials,
  })

  if (!result.ok || !result.data) {
    return NextResponse.json(
      {
        message: result.message,
        /* The gateway answers 403 both for an unverified email and for an
           admin-suspended account; only the first gets the resend prompt. */
        emailNotVerified:
          result.status === 403 && result.message === "Email not verified",
        accountSuspended:
          result.status === 403 && result.message === "Account suspended",
      },
      { status: result.status }
    )
  }

  const { deletionCancelled, ...tokens } = result.data
  await setSessionCookies(tokens)
  /* Signing in during the deletion grace period cancels the deletion; the
     form tells the learner so they aren't left wondering. */
  return NextResponse.json({ ok: true, deletionCancelled: !!deletionCancelled })
}
