"use client"

import { useEffect } from "react"
import Link from "next/link"
import * as Sentry from "@sentry/nextjs"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error)
    /* Same rule as app/global-error.tsx: report browser errors; server ones
       (with a digest) were already reported by onRequestError. */
    if (!error.digest) Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex size-16 rounded-2xl bg-destructive/10 items-center justify-center mb-6">
          <AlertTriangle className="size-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Something went wrong</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-bg-primary text-white text-sm font-semibold hover:opacity-90 transition-all"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:border-violet-300 transition-all">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
