import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs"

/**
 * Removes credentials and personal data from an error event before it leaves
 * the app. `sendDefaultPii: false` is not enough on its own: captured server
 * requests still carried the session cookies and the Authorization header.
 *
 * Dropped: cookies, the request body, auth/session/proxy headers, and query
 * strings — reset-password and verify-email links carry tokens there.
 */
const SENSITIVE_HEADERS = new Set([
  "cookie",
  "set-cookie",
  "authorization",
  "x-apsara-proxy-secret",
  "x-apsara-client-ip",
  "x-forwarded-for",
  "x-real-ip",
])

export function stripQuery(url: string): string {
  const cut = url.search(/[?#]/)
  return cut === -1 ? url : url.slice(0, cut)
}

export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const request = event.request
  if (request) {
    delete request.cookies
    delete request.data
    delete request.query_string
    if (request.url) request.url = stripQuery(request.url)
    if (request.headers) {
      for (const name of Object.keys(request.headers)) {
        if (SENSITIVE_HEADERS.has(name.toLowerCase())) {
          delete request.headers[name]
        }
      }
    }
  }
  delete event.user
  return event
}

export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb {
  const url = breadcrumb.data?.url
  if (typeof url === "string") {
    breadcrumb.data = { ...breadcrumb.data, url: stripQuery(url) }
  }
  return breadcrumb
}
