"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import {
  ArrowRight,
  Check,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { getSubscriptionPlans } from "@/lib/api/subscription"
import type { IApiPlan } from "@/utils/interfaces/subscription/api.interface"

export function LandingPricing() {
  const t = useTranslations("pricing")
  const locale = useLocale()
  const [plans, setPlans] = useState<IApiPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    getSubscriptionPlans()
      .then((availablePlans) => {
        const paidPlans = availablePlans.filter((plan) => plan.price > 0)
        if (active)
          setPlans((paidPlans.length ? paidPlans : availablePlans).slice(0, 1))
      })
      .catch(() => {
        // The section keeps a useful premium preview if live prices are offline.
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(price)

  const freeFeatures = t.raw("landing.freeFeatures") as string[]
  const premiumFeatures = t.raw("landing.premiumFeatures") as string[]

  return (
    <section
      id="pricing"
      className="landing-pricing relative scroll-mt-20 overflow-hidden px-6 py-28"
    >
      <div aria-hidden className="pricing-glow absolute inset-0" />
      <div className="relative mx-auto max-w-6xl">
        <AnimateIn
          animation="fade-up"
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
            <Sparkles className="size-3.5" />
            {t("landing.badge")}
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            {t("landing.headingPart1")}{" "}
            <span className="gradient-text-animated">
              {t("landing.headingHighlight")}
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {t("landing.subtitle")}
          </p>
        </AnimateIn>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <AnimateIn animation="fade-right" className="h-full">
            <article className="landing-interactive-card pricing-card card-surface flex h-full flex-col rounded-[1.75rem] p-7 md:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                    {t("landing.freeEyebrow")}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-foreground">
                    {t("landing.freePlan")}
                  </h3>
                </div>
                <div className="landing-card-icon flex size-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                  <GraduationCap className="size-5" />
                </div>
              </div>

              <div className="mb-6 flex h-6 items-center">
                <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  {t("freePlan")}
                </span>
              </div>

              <div className="flex items-end gap-2">
                <span className="text-5xl font-black tracking-tight text-foreground">
                  $0
                </span>
                <span className="pb-1.5 text-sm text-muted-foreground">
                  {t("landing.forever")}
                </span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-relaxed text-muted-foreground">
                {t("landing.freeDesc")}
              </p>

              <ul className="mt-7 flex-1 space-y-3.5">
                {freeFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className="landing-action mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-foreground hover:border-blue-400"
              >
                {t("landing.startFree")}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          </AnimateIn>

          <AnimateIn animation="fade-left" className="h-full">
            <article className="landing-interactive-card pricing-card pricing-card-featured relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-blue-400/30 p-7 text-white shadow-2xl md:p-8">
              <div
                aria-hidden
                className="absolute -top-20 -right-20 size-64 rounded-full bg-cyan-300/15 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-24 -left-16 size-64 rounded-full bg-indigo-400/20 blur-3xl"
              />
              <div className="relative mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-cyan-200">
                    {t("landing.premiumEyebrow")}
                  </p>
                  <h3 className="mt-1 text-2xl font-bold">
                    {plans[0]?.name ?? t("landing.premiumPlan")}
                  </h3>
                </div>
                <div className="landing-card-icon flex size-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-cyan-200 backdrop-blur">
                  <Sparkles className="size-5" />
                </div>
              </div>

              <div className="relative mb-6 flex h-6 items-center">
                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100 backdrop-blur">
                  {t("landing.popular")}
                </span>
              </div>

              {loading ? (
                <div className="relative flex h-16 items-center">
                  <Loader2 className="size-7 animate-spin text-cyan-200" />
                </div>
              ) : plans[0] ? (
                <div className="relative flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tight">
                    {formatPrice(plans[0].price)}
                  </span>
                  {plans[0].billingPeriod !== "lifetime" && (
                    <span className="pb-1.5 text-sm text-blue-100/75">
                      /
                      {t(
                        plans[0].billingPeriod === "yearly" ? "year" : "month"
                      )}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative text-3xl font-bold">
                  {t("landing.flexiblePricing")}
                </div>
              )}

              <p className="relative mt-4 min-h-12 text-sm leading-relaxed text-blue-100/80">
                {plans[0]?.description ?? t("landing.premiumDesc")}
              </p>

              <ul className="relative mt-7 flex-1 space-y-3.5">
                {(plans[0]?.entitlements?.length
                  ? plans[0].entitlements.map((entitlement) =>
                      t(`features.${entitlement}`)
                    )
                  : premiumFeatures
                ).map((label) => (
                  <li
                    key={label}
                    className="flex items-start gap-3 text-sm text-white"
                  >
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-white/12 text-cyan-200">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className="landing-action relative mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-bold text-blue-700 hover:bg-blue-50"
              >
                {t("landing.viewPlans")}
                <ArrowRight className="size-4" />
              </Link>
            </article>
          </AnimateIn>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          {t("landing.secure")}
        </div>
      </div>
    </section>
  )
}
