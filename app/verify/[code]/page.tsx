"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { BadgeCheck, Loader2, ShieldX } from "lucide-react"
import { useTranslations } from "next-intl"
import { CertificateSheet } from "@/components/certificate/certificate-sheet"
import { CertificateActions } from "@/components/certificate/certificate-actions"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingFooter } from "@/components/landing/landing-footer"
import { certificateFontClass } from "@/lib/fonts/certificate"
import { verifyCertificate } from "@/lib/api/certificates"
import { useLanguageStore } from "@/stores/languages/language-store"
import type { IApiCertificateVerification } from "@/utils/interfaces/certificate/api.interface"

/**
 * Public certificate verification — the canonical, shareable URL for a
 * certificate. No session required: an employer holding the code has to be able
 * to check it without an account, which is the entire point of issuing one.
 */
export default function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = use(params)
  const t = useTranslations("certificates")
  const { language } = useLanguageStore()

  const [menuOpen, setMenuOpen] = useState(false)
  const [result, setResult] = useState<IApiCertificateVerification | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    verifyCertificate(code)
      .then((data) => !cancelled && setResult(data))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [code])

  const shareUrl = typeof window === "undefined" ? "" : window.location.href
  const verifyLabel =
    typeof window === "undefined"
      ? "apsaraelearning.com/verify"
      : `${window.location.host}/verify`

  return (
    <div className={certificateFontClass}>
      <div className="no-print">
        <LandingNavbar
          menuOpen={menuOpen}
          onMenuToggle={() => setMenuOpen((open) => !open)}
        />
      </div>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-28 sm:px-6">
        {result === null && !failed && (
          <div className="flex justify-center py-24 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span className="sr-only">{t("verifying")}</span>
          </div>
        )}

        {failed && (
          <Status
            tone="invalid"
            title={t("verifyUnavailableTitle")}
            body={t("verifyUnavailableBody")}
          />
        )}

        {result && !result.valid && (
          <Status
            tone="invalid"
            title={t("invalidTitle")}
            body={result.revokedAt ? t("revokedBody") : t("invalidBody")}
            code={result.code}
          />
        )}

        {result?.valid && (
          <>
            <div className="no-print mb-8">
              <Status
                tone="valid"
                title={t("validTitle")}
                body={t("validBody", { name: result.learnerName ?? "" })}
                code={result.code}
              />
            </div>

            <CertificateSheet
              learnerName={result.learnerName ?? "Learner"}
              courseTitle={
                language === "km" && result.courseTitleKm
                  ? result.courseTitleKm
                  : (result.courseTitle ?? "")
              }
              courseTitleKm={
                language === "km" ? result.courseTitle : result.courseTitleKm
              }
              code={result.code}
              issuedAt={result.issuedAt ?? new Date().toISOString()}
              verifyUrl={verifyLabel}
            />

            <div className="mt-8">
              <CertificateActions shareUrl={shareUrl} />
            </div>
          </>
        )}

        {(failed || (result && !result.valid)) && (
          <p className="no-print mt-8 text-center text-sm text-muted-foreground">
            <Link href="/verify" className="underline underline-offset-4">
              {t("tryAnotherCode")}
            </Link>
          </p>
        )}
      </main>

      <div className="no-print">
        <LandingFooter />
      </div>
    </div>
  )
}

/* ── Verification banner ──────────────────────────────────────────────── */

function Status({
  tone,
  title,
  body,
  code,
}: {
  tone: "valid" | "invalid"
  title: string
  body: string
  code?: string
}) {
  const valid = tone === "valid"
  const Icon = valid ? BadgeCheck : ShieldX

  return (
    <div
      className={`mx-auto flex max-w-2xl items-start gap-4 rounded-2xl border p-5 ${
        valid
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10"
          : "border-amber-200 bg-amber-50 dark:border-amber-500/25 dark:bg-amber-500/10"
      }`}
      role="status"
    >
      <Icon
        className={`mt-0.5 size-6 shrink-0 ${
          valid
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-amber-600 dark:text-amber-400"
        }`}
      />
      <div className="min-w-0">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        {code && (
          <p className="mt-2 font-mono text-xs tracking-wider text-muted-foreground">
            {code}
          </p>
        )}
      </div>
    </div>
  )
}
