"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, CreditCard, Loader2, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { ApiError } from "@/lib/api/client"
import {
  createBillingPortalSession,
  createCheckoutSession,
  getActiveSubscription,
  getSubscriptionPlans,
} from "@/lib/api/subscription"
import type {
  IApiActiveSubscription,
  IApiPlan,
} from "@/utils/interfaces/subscription/api.interface"

export default function PricingPage() {
  const t = useTranslations("pricing")
  const router = useRouter()
  const [plans, setPlans] = useState<IApiPlan[]>([])
  const [active, setActive] = useState<IApiActiveSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getSubscriptionPlans(),
      getActiveSubscription().catch(() => null),
    ])
      .then(([availablePlans, current]) => {
        setPlans(availablePlans)
        setActive(current)
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoading(false))
  }, [t])

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
            <div className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4" />
              {t("currentPlan", { plan: active.plan.name })}
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
              {t("manageBilling")}
            </button>
          </div>
        )}

        {error && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-destructive">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-6 animate-spin text-violet-500" />
          </div>
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
                    <span className="pb-1 text-xs text-muted-foreground">
                      /{t(plan.billingPeriod === "yearly" ? "year" : "month")}
                    </span>
                  </div>
                  <button
                    onClick={() => (active ? manageBilling() : checkout(plan))}
                    disabled={pending !== null || !plan.stripePriceId}
                    className="gradient-bg-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {pending === plan.id && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    {isCurrent
                      ? t("current")
                      : active
                        ? t("manageBilling")
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
