import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"
import { malformedBodyResponse, readJsonBody } from "@/lib/auth/read-json-body"

/**
 * Re-sends the verification email. The response is intentionally the same
 * whether or not the address exists, so this can't be used to enumerate accounts.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request)
  if (!body) return malformedBodyResponse()
  const { email } = body

  if (!email) {
    return NextResponse.json({ message: "Missing email" }, { status: 400 })
  }

  await callGateway("/auth/resend-verification", { body: { email } })

  return NextResponse.json({ ok: true })
}
