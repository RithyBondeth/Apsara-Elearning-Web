import { NextResponse } from "next/server"

/**
 * The request body as a JSON object, or null when it's malformed or isn't an
 * object (`null`, a string, an array). Route handlers used to call
 * `request.json()` and destructure it directly, so junk input — from bots,
 * mostly — threw and came back as a 500 that also landed in error tracking.
 */
export async function readJsonBody(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json()
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/** The 400 for a body readJsonBody rejected. */
export function malformedBodyResponse() {
  return NextResponse.json(
    { message: "Request body must be a JSON object" },
    { status: 400 }
  )
}
