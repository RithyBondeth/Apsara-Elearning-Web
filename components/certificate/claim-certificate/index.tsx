"use client"

import { useState } from "react"
import Link from "next/link"
import { Award, ArrowRight, Loader2, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { ApiError } from "@/lib/api/client"
import { claimCertificate } from "@/lib/api/certificates"

type TState =
  | { kind: "idle" }
  | { kind: "claiming" }
  | { kind: "claimed"; code: string }
  | { kind: "needsPlan" }
  | { kind: "error" }

/**
 * Offered on a course the learner has finished.
 *
 * The backend already issues automatically on completion, so this usually just
 * returns the certificate that exists — it matters for someone who finished the
 * course before subscribing, and issuing is idempotent either way.
 */
export function ClaimCertificate({ courseId }: { courseId: string }) {
  const t = useTranslations("certificates")
  const tCourse = useTranslations("courseDetail")
  const [state, setState] = useState<TState>({ kind: "idle" })

  const claim = async () => {
    setState({ kind: "claiming" })
    try {
      const certificate = await claimCertificate(courseId)
      setState({ kind: "claimed", code: certificate.code })
    } catch (error) {
      // 403 is the only failure the learner can act on: their plan doesn't
      // include certificates, and /pricing is where that gets fixed.
      if (error instanceof ApiError && error.status === 403) {
        setState({ kind: "needsPlan" })
      } else {
        setState({ kind: "error" })
      }
    }
  }

  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center dark:border-emerald-500/25 dark:bg-emerald-500/10">
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
        <Award className="size-5" />
      </div>

      <p className="mt-3 text-sm font-semibold text-foreground">
        {tCourse("courseComplete")}
      </p>

      {state.kind === "claimed" ? (
        <>
          <p className="mt-1 font-mono text-xs tracking-wider text-muted-foreground">
            {state.code}
          </p>
          <Link
            href={`/verify/${state.code}`}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            {t("viewAction")}
            <ArrowRight className="size-4" />
          </Link>
        </>
      ) : state.kind === "needsPlan" ? (
        <>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {tCourse("certificateNeedsPlan")}
          </p>
          <Link
            href="/pricing"
            className="gradient-bg-primary mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Sparkles className="size-4" />
            {tCourse("upgradeToUnlock")}
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {state.kind === "error"
              ? t("loadError")
              : tCourse("certificateReady")}
          </p>
          <button
            type="button"
            onClick={() => void claim()}
            disabled={state.kind === "claiming"}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {state.kind === "claiming" && (
              <Loader2 className="size-4 animate-spin" />
            )}
            {tCourse("getCertificate")}
          </button>
        </>
      )}
    </div>
  )
}
