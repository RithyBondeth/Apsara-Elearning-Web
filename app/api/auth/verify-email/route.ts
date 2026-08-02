import { NextResponse } from "next/server"
import { callGateway } from "@/lib/auth/gateway"

/** Confirms the emailed token. No session is started — the user then logs in. */
export async function POST(request: Request) {
  const { token } = await request.json()

  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 400 })
  }

  const result = await callGateway("/auth/verify-email", { body: { token } })

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: result.status })
  }

  return NextResponse.json({ ok: true })
}
