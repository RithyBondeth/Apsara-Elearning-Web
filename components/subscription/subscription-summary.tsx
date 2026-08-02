"use client"

import { useState } from "react"
import Link from "next/link"
import { CalendarDays, CreditCard, Crown, Loader2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createBillingPortalSession } from "@/lib/api/subscription"
import { useSubscriptionStore } from "@/stores/subscriptions/subscription-store"

export function SubscriptionSummary() {
  const t = useTranslations("pricing")
  const locale = useLocale()
  const active = useSubscriptionStore((state) => state.active)
  const loading = useSubscriptionStore((state) => state.loading)
  const loaded = useSubscriptionStore((state) => state.loaded)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState(false)

  const manage = async () => {
    setPending(true)
    setError(false)
    try {
      const session = await createBillingPortalSession()
      window.location.assign(session.url)
    } catch {
      setError(true)
      setPending(false)
    }
  }

  if (loading && !loaded) {
    return <Card className="h-32 animate-pulse rounded-2xl bg-muted/40" />
  }

  if (!active) {
    return (
      <Card className="flex flex-col gap-4 rounded-2xl border-violet-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-violet-500/20">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Crown className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{t("freePlan")}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("freePlanDesc")}
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/pricing">{t("upgrade")}</Link>
        </Button>
      </Card>
    )
  }

  const subscription = active.subscription
  const dateValue =
    subscription.status === "trialing"
      ? (subscription.trialEndsAt ?? subscription.currentPeriodEnd)
      : (subscription.graceEndsAt ?? subscription.currentPeriodEnd)
  const formattedDate = dateValue
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(dateValue)
      )
    : null
  const dateLabel = subscription.cancelAtPeriodEnd
    ? "accessEnds"
    : subscription.status === "trialing"
      ? "trialEnds"
      : subscription.graceEndsAt
        ? "graceEnds"
        : "renewsOn"

  return (
    <Card className="rounded-2xl border-emerald-200 p-5 dark:border-emerald-500/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Crown className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground">
                {active.plan.name}
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:bg-emerald-500/15 dark:text-emerald-300">
                {t("active")}
              </span>
            </div>
            {formattedDate && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                {t(dateLabel, { date: formattedDate })}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={manage}
          disabled={pending}
          className="shrink-0"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <CreditCard className="size-4" />
          )}
          {t("manageSubscription")}
        </Button>
      </div>
      {error && (
        <p className="mt-3 text-xs text-destructive">{t("portalError")}</p>
      )}
    </Card>
  )
}
