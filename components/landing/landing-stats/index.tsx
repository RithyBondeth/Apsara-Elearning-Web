"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { CountUp } from "@/components/utils/animations/count-up"
import { SpotlightCard } from "@/components/utils/animations/spotlight-card"
import { TypographySmall } from "@/components/utils/typography/typography-small"
import { Skeleton } from "@/components/ui/skeleton"
import { getPlatformStats } from "@/lib/api/catalog"
import type { IApiPlatformStats } from "@/utils/interfaces/catalog/api.interface"

/** Display order; each key is both a stats field and a `stats.*` message. */
const STAT_KEYS = ["courses", "lessons", "questions", "subjects"] as const

/** Static class names so Tailwind keeps them — one column per visible stat. */
const MD_COLS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
}

export function LandingStats() {
  const t = useTranslations("stats")
  const [stats, setStats] = useState<IApiPlatformStats | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    getPlatformStats()
      .then((s) => active && setStats(s))
      .catch(() => active && setFailed(true))
    return () => {
      active = false
    }
  }, [])

  // Only real, non-zero totals are shown; with nothing to show, the band is dropped.
  const visible = stats ? STAT_KEYS.filter((key) => stats[key] > 0) : []
  if (failed || (stats && visible.length === 0)) return null

  const count = stats ? visible.length : STAT_KEYS.length

  return (
    <section className="landing-section-tinted relative overflow-hidden border-y border-border py-12">
      {/* Faint moving gradient wash behind the numbers */}
      <div
        aria-hidden
        className="animate-gradient pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
        style={{
          background:
            "linear-gradient(110deg, transparent 20%, rgba(35,131,226,0.06) 40%, rgba(124,92,255,0.06) 55%, transparent 80%)",
        }}
      />
      <div className={`relative mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 ${MD_COLS[count]}`}>
        {!stats
          ? STAT_KEYS.map((key) => (
              <Skeleton key={key} className="h-[104px] rounded-2xl" aria-busy="true" />
            ))
          : visible.map((key, i) => (
              <AnimateIn key={key} animation="bounce-in" delay={i * 0.1}>
                <SpotlightCard className="landing-interactive-card group rounded-2xl border border-transparent px-4 py-5 text-center hover:bg-card">
                  <div className="gradient-text mb-1 text-3xl font-bold md:text-4xl">
                    <CountUp
                      to={stats[key]}
                      locale
                      delay={i * 0.1 + 0.5}
                      duration={1.8}
                      ease="power3.out"
                    />
                  </div>
                  <TypographySmall className="font-medium text-foreground block">
                    {t(key)}
                  </TypographySmall>
                  <div className="mx-auto mt-3 h-0.5 w-8 origin-center scale-x-0 rounded-full gradient-bg-primary transition-transform duration-300 group-hover:scale-x-100" />
                </SpotlightCard>
              </AnimateIn>
            ))}
      </div>
    </section>
  )
}
