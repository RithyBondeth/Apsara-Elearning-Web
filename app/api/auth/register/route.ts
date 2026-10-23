import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"
import { malformedBodyResponse, readJsonBody } from "@/lib/auth/read-json-body"

interface IRegisterResult {
  message: string
}

/**
 * Registration creates an unverified account but never issues session tokens.
 * The client sends the user to the verify-email notice and login is permitted
 * only after verification succeeds.
 */
export async function POST(request: Request) {
  const payload = await readJsonBody(request)
  if (!payload) return malformedBodyResponse()

  const result = await callGateway<IRegisterResult>("/auth/register", {
    body: payload,
  })

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status }
    )
  }

  return NextResponse.json({ ok: true })
}
