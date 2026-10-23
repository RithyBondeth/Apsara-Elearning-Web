import * as Sentry from "@sentry/nextjs"
import { scrubBreadcrumb, scrubEvent } from "@/lib/observability/scrub"

/* Browser error tracking: uncaught errors and unhandled rejections. A no-op
   without NEXT_PUBLIC_SENTRY_DSN (inlined at build time). Errors only — no
   tracing, no session replay — and no personal data. */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV,
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: scrubEvent,
    beforeBreadcrumb: scrubBreadcrumb,
  })
}
