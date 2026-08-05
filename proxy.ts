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

/**
 * Routes that require a session. Prefix-matched.
 *
 * `/tutor` belongs here because every endpoint behind it is guarded by the
 * gateway's JwtAuthGuard — without the redirect an anonymous visitor gets a
 * signed-in-looking page that 401s on every request instead of a login prompt.
 * Same for `/certificates`, which lists the learner's own.
 *
 * `/verify` is deliberately absent: verifying a certificate is public, because
 * the person checking one is usually not a learner at all.
 *
 * `/admin` only gets the session check here — being an admin is not knowable
 * from a cookie. `app/admin/layout.tsx` resolves the actual admin claim from
 * `/user/me` server-side, and the gateway's `AdminGuard` is what enforces it.
 */
const PROTECTED = [
  "/dashboard",
  "/learn",
  "/profile",
  "/tutor",
  "/certificates",
  "/activity",
  "/billing",
  "/admin",
]

/**
 * Routes a signed-in user has no reason to see. `/verify-email` is deliberately
 * absent: a signed-in-but-unverified user still needs to reach it.
 */
const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(REFRESH_COOKIE)?.value)

  /* Cookie-authenticated mutations must originate from this exact origin.
     SameSite=Lax is a strong baseline, but sibling subdomains are still
     considered same-site by browsers and therefore need an origin check. */
  const isSessionMutation =
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    (pathname.startsWith("/api/auth/") ||
      pathname.startsWith("/api/proxy/") ||
      pathname.startsWith("/api/admin/"))

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
  /*
   * Include API routes for CSRF checks; page gating ignores routes not listed
   * above. Static assets remain excluded — but only by a real file extension
   * anchored to the end of the path.
   *
   * The previous pattern excluded any path containing a dot *anywhere*, which
   * quietly opted real routes out of the middleware: `/api/proxy/course/a.b`
   * skipped the origin check above, and a lesson slug with a dot
   * (`/learn/algebra-1.2`) skipped the session redirect.
   *
   * Must stay a literal — Next statically analyses this at build time and
   * silently ignores an interpolated value.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js|mjs|map|txt|xml|json|woff2?|ttf|otf)$).*)",
  ],
}
