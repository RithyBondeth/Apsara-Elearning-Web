import { NextResponse, type NextRequest } from "next/server"

import { REFRESH_COOKIE } from "@/lib/auth/cookie-names"
import { NEXT_PARAM } from "@/lib/auth/next-param"

/**
 * Routing-level session gating.
 *
 * This checks for the presence of the refresh cookie only — it does not verify
 * any signature. That is deliberate: the proxy decides *where to send someone*,
 * while real authorization is enforced by the gateway's JwtAuthGuard on every
 * request. Forging a cookie here buys you a redirect, not data.
 *
 * The refresh cookie (7d) is the session signal rather than the access cookie
 * (1d), so a user with an expired access token is still treated as signed in and
 * gets silently refreshed instead of bounced to /login.
 */

/** Routes that require a session. Prefix-matched. */
const PROTECTED = ["/dashboard", "/learn", "/profile"]

/** Routes a signed-in user has no reason to see. */
const AUTH_ROUTES = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(REFRESH_COOKIE)?.value)

  /* Cookie-authenticated mutations must originate from this exact origin.
     SameSite=Lax is a strong baseline, but sibling subdomains are still
     considered same-site by browsers and therefore need an origin check. */
  const isSessionMutation =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    (pathname.startsWith("/api/auth/") || pathname.startsWith("/api/proxy/"))

  if (isSessionMutation) {
    const origin = request.headers.get("origin")
    const allowMissingOrigin = process.env.NODE_ENV !== "production" && !origin
    const configuredOrigin = process.env.APP_ORIGIN?.replace(/\/$/, "")
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host")
    const protocol =
      request.headers.get("x-forwarded-proto") ??
      request.nextUrl.protocol.replace(":", "")
    const expectedOrigin =
      configuredOrigin ?? (host ? `${protocol}://${host}` : request.nextUrl.origin)

    if (!allowMissingOrigin && origin !== expectedOrigin) {
      return NextResponse.json(
        { message: "Invalid request origin" },
        { status: 403 }
      )
    }
  }

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !hasSession) {
    const loginUrl = new URL("/login", request.url)
    /* Preserve the destination so login can return the user to it. */
    loginUrl.searchParams.set(NEXT_PARAM, pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (AUTH_ROUTES.some((p) => pathname.startsWith(p)) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  /* Include API routes for CSRF checks; page gating ignores routes not listed
     above. Static assets and files remain excluded. */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.).*)"],
}
