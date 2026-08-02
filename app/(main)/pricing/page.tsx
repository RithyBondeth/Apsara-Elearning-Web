"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Award,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Loader2,
  Sparkles,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { useHasSession } from "@/components/utils/session/session-provider"
import { ApiError } from "@/lib/api/client"
import {
  createBillingPortalSession,
  createCheckoutSession,
} from "@/lib/api/subscription"
import type { IApiPlan } from "@/utils/interfaces/subscription/api.interface"
import { useSubscriptionStore } from "@/stores/subscriptions/subscription-store"

const FEATURE_ICONS = {
  "courses:premium": GraduationCap,
  "ai:tutor": Bot,
  certificates: Award,
} as const

export default function PricingPage() {
  const t = useTranslations("pricing")
  const locale = useLocale()
  const router = useRouter()
  const plans = useSubscriptionStore((state) => state.plans)
  const active = useSubscriptionStore((state) => state.active)
  const loading = useSubscriptionStore((state) => state.loading)
  const loaded = useSubscriptionStore((state) => state.loaded)
  const loadError = useSubscriptionStore((state) => state.error)
  const hydrate = useSubscriptionStore((state) => state.hydrate)
  const hasSession = useHasSession()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void hydrate({ authed: hasSession })
  }, [hydrate, hasSession])

  const checkout = async (plan: IApiPlan) => {
    setPending(plan.id)
    setError(null)
    try {
      const session = await createCheckoutSession(plan.id)
      window.location.assign(session.url)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push("/login?next=/pricing")
        return
      }
      setError(err instanceof Error ? err.message : t("checkoutError"))
      setPending(null)
    }
  }

  const manageBilling = async () => {
    setPending("portal")
    setError(null)
    try {
      const session = await createBillingPortalSession()
      window.location.assign(session.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("portalError"))
      setPending(null)
    }
  }

  const subscription = active?.subscription
  const renewalValue = subscription
    ? subscription.status === "trialing"
      ? (subscription.trialEndsAt ?? subscription.currentPeriodEnd)
      : (subscription.graceEndsAt ?? subscription.currentPeriodEnd)
    : null
  const renewalDate = renewalValue
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
        new Date(renewalValue)
      )
    : null
  const renewalKey = subscription?.cancelAtPeriodEnd
    ? "accessEnds"
    : subscription?.status === "trialing"
      ? "trialEnds"
      : subscription?.graceEndsAt
        ? "graceEnds"
        : "renewsOn"

  return (
    <AppShell>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <Sparkles className="size-6" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {active && (
          <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 sm:flex-row dark:border-emerald-500/25 dark:bg-emerald-500/10">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-4" />
                {t("currentPlan", { plan: active.plan.name })}
              </div>
              {renewalDate && (
                <div className="mt-1 flex items-center gap-1.5 pl-6 text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  <CalendarDays className="size-3.5" />
                  {t(renewalKey, { date: renewalDate })}
                </div>
              )}
            </div>
            <button
              onClick={manageBilling}
              disabled={pending !== null}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-50 dark:border-emerald-500/40 dark:text-emerald-300"
            >
              {pending === "portal" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CreditCard className="size-3.5" />
              )}
              {t("manageSubscription")}
            </button>
          </div>
        )}

        {(error || loadError) && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-destructive">
            {error ?? t("loadError")}
          </p>
        )}

        {loading && !loaded ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-violet-500" />
          </div>
        ) : loaded && plans.length === 0 ? (
          <p className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("noPlans")}
          </p>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {plans.map((plan) => {
              const isCurrent = active?.plan.id === plan.id
              return (
                <article
                  key={plan.id}
                  className="card-surface rounded-2xl border border-border p-6"
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    {plan.name}
                  </h2>
                  {plan.description && (
                    <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                      {plan.description}
                    </p>
                  )}
                  <div className="mt-5 flex items-end gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      ${plan.price.toFixed(2)}
                    </span>
                    {plan.billingPeriod !== "lifetime" && (
                      <span className="pb-1 text-xs text-muted-foreground">
                        /{t(plan.billingPeriod === "yearly" ? "year" : "month")}
                      </span>
                    )}
                  </div>
                  {plan.trialDays > 0 && (
                    <p className="mt-2 text-xs font-medium text-violet-600 dark:text-violet-300">
                      {t("trialOffer", { days: plan.trialDays })}
                    </p>
                  )}
                  <ul className="mt-5 space-y-2.5">
                    {(plan.entitlements ?? []).map((entitlement) => {
                      const FeatureIcon = FEATURE_ICONS[entitlement]
                      return (
                        <li
                          key={entitlement}
                          className="flex items-center gap-2.5 text-sm text-foreground"
                        >
                          <span className="flex size-6 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
                            {FeatureIcon ? (
                              <FeatureIcon className="size-3.5" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                          </span>
                          {t(`features.${entitlement}`)}
                        </li>
                      )
                    })}
                  </ul>
                  <button
                    onClick={() => (active ? manageBilling() : checkout(plan))}
                    disabled={pending !== null || !plan.stripePriceId}
                    className="gradient-bg-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {(pending === plan.id ||
                      (pending === "portal" && active)) && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {isCurrent
                      ? t("manageSubscription")
                      : active
                        ? plan.price > active.plan.price
                          ? t("upgrade")
                          : t("changePlan")
                        : plan.stripePriceId
                          ? t("choose")
                          : t("unavailable")}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </AppShell>
  )
}
