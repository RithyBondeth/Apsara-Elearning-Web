import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"

/**
 * Requests a password-reset email. The response is intentionally the same
 * whether or not the address exists, so this can't be used to enumerate
 * accounts — the gateway already answers generically, and we flatten further.
 */
export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ message: "Missing email" }, { status: 400 })
  }

  await callGateway("/auth/forgot-password", { body: { email } })

  return NextResponse.json({ ok: true })
}
