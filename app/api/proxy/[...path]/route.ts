import { NextResponse, type NextRequest } from "next/server"
import { getAccessToken } from "@/lib/auth/session"
import { refreshSession } from "@/lib/auth/refresh"
import { proxyIdentityHeaders } from "@/lib/api/proxy-headers"

/**
 * Authenticated pass-through to the NestJS gateway.
 *
 * Because the session lives in httpOnly cookies on *this* origin, the browser
 * cannot attach a bearer token itself — every authenticated call is proxied here
 * so the server can read the cookie and set the Authorization header.
 *
 * A 401 triggers one silent refresh-and-retry. Doing it server-side keeps the
 * whole rotation invisible to the client: no interceptor, no retry bookkeeping,
 * and no window where two tabs race to refresh the same token.
 */
const GATEWAY_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL

async function proxy(request: NextRequest, segments: string[]) {
  if (!GATEWAY_URL) {
    return NextResponse.json(
      { message: "API_URL / NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    )
  }

  const path = segments.join("/")
  const search = request.nextUrl.search
  const target = `${GATEWAY_URL}/${path}${search}`

  /* Read the body once — it may need replaying on the post-refresh retry. */
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text()

  /* Declare the real browser IP so the gateway's rate limiter doesn't bucket
     every student behind this server's single address. */
  const identity = await proxyIdentityHeaders(request.headers)

  const send = (token: string | null) =>
    fetch(target, {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...identity,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
    })

  let token = await getAccessToken()
  let res: Response

  try {
    res = await send(token)

    if (res.status === 401) {
      /* Do not delete cookies here: another concurrent request may already
         have rotated the same single-use refresh token successfully. */
      token = await refreshSession({ clearOnFailure: false })
      /* No refresh token, or the gateway rejected it — the session is over. */
      if (!token) {
        return NextResponse.json(
          { message: "Session expired" },
          { status: 401 }
        )
      }
      res = await send(token)
    }
  } catch {
    return NextResponse.json(
      { message: "Cannot reach the server. Please try again." },
      { status: 503 }
    )
  }

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/json",
    },
  })
}

/* Next 16 hands params in as a promise. */
type TContext = { params: Promise<{ path: string[] }> }

export async function GET(request: NextRequest, ctx: TContext) {
  return proxy(request, (await ctx.params).path)
}
export async function POST(request: NextRequest, ctx: TContext) {
  return proxy(request, (await ctx.params).path)
}
export async function PATCH(request: NextRequest, ctx: TContext) {
  return proxy(request, (await ctx.params).path)
}
export async function PUT(request: NextRequest, ctx: TContext) {
  return proxy(request, (await ctx.params).path)
}
export async function DELETE(request: NextRequest, ctx: TContext) {
  return proxy(request, (await ctx.params).path)
}
