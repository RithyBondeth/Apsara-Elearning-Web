import { NextResponse, type NextRequest } from "next/server"
import { getAccessToken } from "@/lib/auth/session"
import { refreshSession } from "@/lib/auth/refresh"
import { proxyIdentityHeaders } from "@/lib/api/proxy-headers"

/**
 * Authenticated pass-through to the **admin** gateway.
 *
 * This is a second proxy rather than a path on `/api/proxy/*` because the admin
 * gateway is a separate service on its own port with its own `/admin` prefix and
 * its own `AdminGuard` — not a route group on the public api-gateway. Folding it
 * into the existing proxy would mean the browser choosing which gateway a call
 * lands on, which is exactly the decision that should stay on the server.
 *
 * `ADMIN_API_URL` deliberately has no `NEXT_PUBLIC_` prefix: the admin gateway's
 * address never reaches the browser bundle. The browser only ever calls this
 * same-origin route, and the session cookie is httpOnly, so the bearer token is
 * attached here.
 *
 * Authorization is *not* decided here. `AdminGuard` on every admin-gateway route
 * verifies the JWT and its admin claim; the redirect in `app/admin/layout.tsx`
 * is a routing convenience only.
 */
const ADMIN_GATEWAY_URL = process.env.ADMIN_API_URL

async function proxy(request: NextRequest, segments: string[]) {
  if (!ADMIN_GATEWAY_URL) {
    return NextResponse.json(
      { message: "ADMIN_API_URL is not configured" },
      { status: 500 }
    )
  }

  const path = segments.join("/")
  const search = request.nextUrl.search
  const target = `${ADMIN_GATEWAY_URL}/${path}${search}`

  /* Read the body once — it may need replaying on the post-refresh retry. */
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text()

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
      if (!token) {
        return NextResponse.json({ message: "Session expired" }, { status: 401 })
      }
      res = await send(token)
    }
  } catch {
    return NextResponse.json(
      { message: "Cannot reach the admin server. Please try again." },
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
