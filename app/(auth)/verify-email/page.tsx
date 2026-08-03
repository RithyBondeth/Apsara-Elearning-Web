"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

  const cardTitle =
    status === "success"
      ? t("verifySuccess")
      : status === "failed"
        ? t("verifyFailed")
        : status === "notice"
          ? t("verifySentTitle")
          : t("verifyTitle")

  const cardSubtitle =
    status === "checking"
      ? t("verifyChecking")
      : status === "notice"
        ? t("verifySentBody", { email: email || "your email" })
        : undefined

  return (
    <div className="flex h-svh w-full items-center justify-center px-4 pb-4 pt-20 sm:px-6">
      <AuthCard
        title={cardTitle}
        subtitle={cardSubtitle}
        footer={
          status === "notice" ? (
            <Link
              href={loginHref}
              className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {t("goToLogin")}
            </Link>
          ) : undefined
        }
      >
        <div className="space-y-4 text-center">
        {status === "checking" && (
          <div className="h-1.5 overflow-hidden rounded-full bg-blue-100 dark:bg-blue-400/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-500" />
          </div>
        )}

        {status === "success" && (
          <Button asChild className="auth-email-button w-full">
              <Link href={loginHref}>{t("goToLogin")}</Link>
          </Button>
        )}

        {status === "failed" && (
          <div className="space-y-2">
              <Button onClick={resend} className="auth-email-button w-full">
                {t("resendVerification")}
              </Button>
              {/* Let them re-paste a fresh token without leaving the page. */}
              <Button onClick={() => setStatus("notice")} variant="ghost" className="w-full">
                {t("verifyTitle")}
              </Button>
          </div>
        )}

        {status === "notice" && (
            <div className="space-y-3 text-left">
              <Input
                label={t("verificationTokenLabel")}
                placeholder={t("verifyTokenPlaceholder")}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="auth-input"
              />
              <Button
                onClick={submitToken}
                disabled={submitting || !token.trim()}
                className="auth-email-button w-full"
              >
                {submitting ? <Loader2 className="animate-spin" /> : t("verifyTitle")}
              </Button>
              <Button onClick={resend} variant="ghost" className="w-full">
                {t("resendVerification")}
              </Button>
            </div>
        )}
        </div>
      </AuthCard>
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
