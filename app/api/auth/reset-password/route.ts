import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"
import { malformedBodyResponse, readJsonBody } from "@/lib/auth/read-json-body"

/**
 * Sets a new password from an emailed reset token. Unlike forgot-password,
 * failures here surface to the user (invalid or expired token), so the
 * gateway's status and message pass through.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request)
  if (!body) return malformedBodyResponse()
  const { token, newPassword } = body

  if (!token || !newPassword) {
    return NextResponse.json(
      { message: "Missing token or new password" },
      { status: 400 }
    )
  }

  const result = await callGateway("/auth/reset-password", {
    body: { token, newPassword },
  })

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    )
  }

  return NextResponse.json({ ok: true })
}
