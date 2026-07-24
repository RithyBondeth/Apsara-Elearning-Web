"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { CheckCircle2, MailCheck, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BrandLogo } from "@/components/utils/brand-logo"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { verifyEmailRequest, resendVerificationRequest } from "@/lib/auth/client"
import { withNext } from "@/lib/auth/next-param"

type TStatus = "notice" | "checking" | "success" | "failed"

function VerifyEmailInner() {
  const t = useTranslations("auth")
  const params = useSearchParams()
  const email = params.get("email") ?? ""
  const urlToken = params.get("token")
  /* Carried from register → verify so login can return the user to where the
     middleware first bounced them. */
  const loginHref = withNext("/login", params.get("next"))

  /* Two entry paths: a `?token=` link auto-verifies; otherwise we show the
     post-register notice with a paste box (the email delivers a raw token, not
     a link — see email.service.ts). */
  const [status, setStatus] = useState<TStatus>(urlToken ? "checking" : "notice")
  const [token, setToken] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const ranForUrlToken = useRef(false)

  useEffect(() => {
    if (!urlToken || ranForUrlToken.current) return
    ranForUrlToken.current = true
    verifyEmailRequest(urlToken).then((r) =>
      setStatus(r.ok ? "success" : "failed")
    )
  }, [urlToken])

  const submitToken = async () => {
    if (!token.trim()) return
    setSubmitting(true)
    const r = await verifyEmailRequest(token.trim())
    setSubmitting(false)
    setStatus(r.ok ? "success" : "failed")
  }

  const resend = async () => {
    if (!email) {
      toast.error(t("registerFailed"))
      return
    }
    await resendVerificationRequest(email)
    toast.success(t("resent"))
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-8 py-12">
      <div className="mb-8">
        <BrandLogo size="lg" />
      </div>

      <div className="w-full max-w-sm space-y-6 text-center">
        {status === "checking" && (
          <>
            <Loader2 className="mx-auto size-10 animate-spin text-violet-500" />
            <TypographyMuted>{t("verifyChecking")}</TypographyMuted>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
            <TypographyH3 className="text-xl font-bold">{t("verifySuccess")}</TypographyH3>
            <Button asChild className="btn-shine w-full">
              <Link href={loginHref}>{t("goToLogin")}</Link>
            </Button>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="mx-auto size-12 text-red-500" />
            <TypographyH3 className="text-xl font-bold">{t("verifyFailed")}</TypographyH3>
            <div className="space-y-2">
              <Button onClick={resend} variant="outline" className="w-full">
                {t("resendVerification")}
              </Button>
              {/* Let them re-paste a fresh token without leaving the page. */}
              <Button onClick={() => setStatus("notice")} variant="ghost" className="w-full">
                {t("verifyTitle")}
              </Button>
            </div>
          </>
        )}

        {status === "notice" && (
          <>
            <MailCheck className="mx-auto size-12 text-violet-500" />
            <TypographyH3 className="text-xl font-bold">{t("verifySentTitle")}</TypographyH3>
            <TypographyMuted className="text-sm">
              {t("verifySentBody", { email: email || "your email" })}
            </TypographyMuted>

            <div className="space-y-2 pt-2 text-left">
              <Input
                placeholder="Paste your verification token…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-background/70"
              />
              <Button
                onClick={submitToken}
                disabled={submitting || !token.trim()}
                className="btn-shine w-full"
              >
                {submitting ? <Loader2 className="animate-spin" /> : t("verifyTitle")}
              </Button>
              <Button onClick={resend} variant="ghost" className="w-full">
                {t("resendVerification")}
              </Button>
            </div>

            <TypographyMuted className="text-sm">
              <Link href={loginHref} className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
                {t("goToLogin")}
              </Link>
            </TypographyMuted>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  )
}
