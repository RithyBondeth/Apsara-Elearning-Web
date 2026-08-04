"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { CreditCard, ExternalLink, Loader2, Receipt, TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { ApiError } from "@/lib/api/client"
import {
  cancelSubscription,
  createBillingPortalSession,
  getActiveSubscription,
  getPaymentHistory,
} from "@/lib/api/subscription"
import type {
  IApiActiveSubscription,
  IApiPayment,
} from "@/utils/interfaces/subscription/api.interface"

function money(amount: number, currency?: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  } catch {
    // Unknown currency code from the provider — show the number rather than throw.
    return `${amount.toFixed(2)} ${currency ?? ""}`.trim()
  }
}

const STATUS_TONE: Record<string, string> = {
  succeeded: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  failed: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  refunded: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
}

export default function BillingPage() {
  const t = useTranslations("billing")
  const [active, setActive] = useState<IApiActiveSubscription | null>(null)
  const [payments, setPayments] = useState<IApiPayment[] | null>(null)
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([getActiveSubscription(), getPaymentHistory()]).then(
      ([sub, history]) => {
        if (cancelled) return
        setActive(sub.status === "fulfilled" ? sub.value : null)
        setPayments(history.status === "fulfilled" ? history.value : [])
        setError(sub.status === "rejected" && history.status === "rejected")
      }
    )
    return () => {
      cancelled = true
    }
  }, [nonce])

  const openPortal = useCallback(async () => {
    setBusy(true)
    try {
      const session = await createBillingPortalSession()
      window.location.assign(session.url)
    } catch (err) {
      // A local rail has no hosted portal; the API says so with a 400 rather
      // than handing back a dead link.
      if (!(err instanceof ApiError)) setError(true)
      setBusy(false)
    }
  }, [])

  const cancel = useCallback(async () => {
    if (!active) return
    setBusy(true)
    try {
      await cancelSubscription(active.subscription.id)
      setNonce((n) => n + 1)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }, [active])

  const loading = payments === null
  const subscription = active?.subscription
  const cancelled = subscription?.cancelAtPeriodEnd

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {error && (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-5 dark:border-amber-500/25 dark:bg-amber-500/10">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          </Card>
        )}

        {!loading && (
          <>
            {/* Current plan */}
            <AnimateIn animation="fade-up" delay={0.1}>
              <Card className="p-6">
                <TypographyH4 className="flex items-center gap-2 text-foreground">
                  <CreditCard className="size-4 text-violet-600 dark:text-violet-400" />
                  {t("currentPlan")}
                </TypographyH4>

                {active ? (
                  <>
                    <p className="mt-3 text-lg font-semibold text-foreground">
                      {active.plan.name}
                    </p>
                    <TypographyMuted className="mt-1 text-sm">
                      {money(active.plan.price)} ·{" "}
                      {subscription?.status ?? ""}
                      {subscription?.currentPeriodEnd &&
                        ` · ${
                          cancelled ? t("endsOn") : t("renewsOn")
                        } ${new Date(
                          subscription.currentPeriodEnd
                        ).toLocaleDateString("en-GB")}`}
                    </TypographyMuted>

                    {cancelled && (
                      <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                        {t("cancelScheduled")}
                      </p>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        variant="outline"
                        onClick={() => void openPortal()}
                        disabled={busy}
                        className="gap-2"
                      >
                        <ExternalLink className="size-4" />
                        {t("managePayment")}
                      </Button>

                      {!cancelled && (
                        <ConfirmDialog
                          title={t("cancelTitle")}
                          description={t("cancelDescription")}
                          variant="danger"
                          onConfirm={() => void cancel()}
                        >
                          <Button variant="outline" disabled={busy}>
                            {t("cancelPlan")}
                          </Button>
                        </ConfirmDialog>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <TypographyMuted className="mt-3 text-sm">
                      {t("noPlan")}
                    </TypographyMuted>
                    <Button asChild className="mt-4">
                      <Link href="/pricing">{t("seePlans")}</Link>
                    </Button>
                  </>
                )}
              </Card>
            </AnimateIn>

            {/* Payment history */}
            <AnimateIn animation="fade-up" delay={0.15}>
              <section className="space-y-3">
                <TypographyH4 className="flex items-center gap-2 text-foreground">
                  <Receipt className="size-4 text-cyan-600 dark:text-cyan-400" />
                  {t("historyTitle")}
                </TypographyH4>

                {payments.length === 0 ? (
                  <Card className="p-6 text-center">
                    <TypographyMuted className="text-sm">
                      {t("noPayments")}
                    </TypographyMuted>
                  </Card>
                ) : (
                  payments.map((payment) => (
                    <Card
                      key={payment.id}
                      className="flex flex-wrap items-center gap-4 p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground">
                          {money(payment.amount, payment.currency)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {new Date(payment.createdAt).toLocaleDateString(
                            "en-GB"
                          )}{" "}
                          · {payment.provider}
                        </p>
                      </div>

                      {payment.refundedAmount > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {t("refunded", {
                            amount: money(
                              payment.refundedAmount,
                              payment.currency
                            ),
                          })}
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          STATUS_TONE[payment.status] ??
                          "bg-muted text-muted-foreground"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </Card>
                  ))
                )}
              </section>
            </AnimateIn>
          </>
        )}
      </div>
    </AppShell>
  )
}
