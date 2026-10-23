"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Gauge,
  Loader2,
  MessageCircle,
  Sparkles,
  TriangleAlert,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { getAiUsage } from "@/lib/api/ai"
import type { IApiAiUsageSummary } from "@/utils/interfaces/ai/api.interface"

/** Token counts are shown in thousands, matching the tutor header. */
const inThousands = (tokens: number) => Math.round(tokens / 1000)

function formatDateTime(iso: string, locale: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString(locale === "km" ? "km-KH" : "en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
}

export default function AiUsagePage() {
  const t = useTranslations("aiUsage")
  const locale = useLocale()
  const [usage, setUsage] = useState<IApiAiUsageSummary | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    getAiUsage()
      .then(setUsage)
      .catch(() => setError(true))
  }, [])

  const usedPercent =
    usage && usage.limit > 0
      ? Math.min(100, Math.round((usage.used / usage.limit) * 100))
      : 0
  const repliesLimit = usage?.repliesLimit ?? null
  const repliesPercent =
    usage && repliesLimit
      ? Math.min(100, Math.round((usage.repliesUsed / repliesLimit) * 100))
      : 0
  const resetDate = usage?.periodEndsAt
    ? new Date(usage.periodEndsAt).toLocaleDateString(
        locale === "km" ? "km-KH" : "en-GB",
        { day: "numeric", month: "long", year: "numeric" }
      )
    : null

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <Link
              href="/tutor"
              className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              {t("backToTutor")}
            </Link>
            <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {!usage && !error && (
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

        {usage && (
          <>
            {/* The plan's replies — shown only when the plan sets a limit. */}
            {repliesLimit !== null && (
              <section className="space-y-3">
                <TypographyH4 className="flex items-center gap-2 text-foreground">
                  <MessageCircle className="size-4 text-violet-600 dark:text-violet-400" />
                  {t("repliesTitle")}
                </TypographyH4>
                <Card className="space-y-3 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {t("repliesUsedOf", {
                        used: usage.repliesUsed,
                        limit: repliesLimit,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("repliesLeft", {
                        remaining: usage.repliesRemaining ?? 0,
                      })}
                      {resetDate &&
                        ` · ${t("repliesResetOn", { date: resetDate })}`}
                    </p>
                  </div>
                  <Progress
                    value={repliesPercent}
                    aria-label={t("repliesTitle")}
                    className="h-2 rounded-full"
                  />
                  {usage.exhausted === "replies" && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      {t("repliesExhausted")}
                    </p>
                  )}
                </Card>
              </section>
            )}

            <section className="space-y-3">
              <TypographyH4 className="flex items-center gap-2 text-foreground">
                <Gauge className="size-4 text-violet-600 dark:text-violet-400" />
                {repliesLimit !== null
                  ? t("tokenCapTitle")
                  : t("allowanceTitle")}
              </TypographyH4>
              <Card className="space-y-3 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-foreground">
                    {t("usedOf", {
                      used: inThousands(usage.used),
                      limit: inThousands(usage.limit),
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("remaining", {
                      remaining: inThousands(usage.remaining),
                    })}
                  </p>
                </div>
                <Progress
                  value={usedPercent}
                  aria-label={t("allowanceTitle")}
                  className="h-2 rounded-full"
                />
                {usage.exhausted === "tokens" && (
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    {t("exhausted")}
                  </p>
                )}
              </Card>
            </section>

            <section className="space-y-3">
              <TypographyH4 className="flex items-center gap-2 text-foreground">
                <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
                {t("recentTitle")}
              </TypographyH4>

              {usage.recent.length === 0 ? (
                <Card className="p-6 text-center">
                  <TypographyMuted className="text-sm">
                    {t("noUsage")}
                  </TypographyMuted>
                </Card>
              ) : (
                <Card className="divide-y divide-border p-0">
                  {usage.recent.map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                    >
                      <p className="text-sm text-foreground">
                        {formatDateTime(record.createdAt, locale)}
                      </p>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {t("tokens", {
                            total: (record.totalTokens ?? 0).toLocaleString(),
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("tokensDetail", {
                            prompt: (record.promptTokens ?? 0).toLocaleString(),
                            completion: (
                              record.completionTokens ?? 0
                            ).toLocaleString(),
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </Card>
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}
