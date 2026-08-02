import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"

/**
 * Re-sends the verification email. The response is intentionally the same
 * whether or not the address exists, so this can't be used to enumerate accounts.
 */
export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ message: "Missing email" }, { status: 400 })
  }

  await callGateway("/auth/resend-verification", { body: { email } })

  return NextResponse.json({ ok: true })
}
