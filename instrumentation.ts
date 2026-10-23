import * as Sentry from "@sentry/nextjs"
import { scrubBreadcrumb, scrubEvent } from "@/lib/observability/scrub"

/**
 * Server-side error tracking (Node and edge). A no-op without a DSN, so local
 * development sends nothing. Errors only — no tracing — and every event is
 * scrubbed of cookies, auth headers, bodies and query strings (scrub.ts).
 */
export function register() {
  const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN
  if (!dsn) return
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  })
}

/** Errors thrown while rendering or in route handlers (a no-op when off). */
export const onRequestError = Sentry.captureRequestError
