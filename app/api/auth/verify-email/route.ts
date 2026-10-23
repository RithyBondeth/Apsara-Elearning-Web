import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"
import { malformedBodyResponse, readJsonBody } from "@/lib/auth/read-json-body"

/** Confirms the emailed token. No session is started — the user then logs in. */
export async function POST(request: Request) {
  const body = await readJsonBody(request)
  if (!body) return malformedBodyResponse()
  const { token } = body

  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 })
  }

  const result = await callGateway("/auth/verify-email", { body: { token } })

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    )
  }

  return NextResponse.json({ ok: true })
}
