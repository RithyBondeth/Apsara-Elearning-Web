"use client"

import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { CountUp } from "@/components/utils/animations/count-up"
import { SpotlightCard } from "@/components/utils/animations/spotlight-card"
import { STATS } from "@/utils/constants/landing.constant"
import { TypographySmall } from "@/components/utils/typography/typography-small"

export function LandingStats() {
  const t = useTranslations("stats")

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
      <div className="relative mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <AnimateIn
            key={stat.key}
            animation="bounce-in"
            delay={i * 0.1}
          >
            <SpotlightCard className="landing-interactive-card group rounded-2xl border border-transparent px-4 py-5 text-center hover:bg-card">
              <div className="gradient-text mb-1 text-3xl font-bold md:text-4xl">
                <CountUp
                  to={stat.count}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  locale={stat.locale}
                  delay={i * 0.1 + 0.5}
                  duration={1.8}
                  ease="power3.out"
                />
              </div>
              <TypographySmall className="font-medium text-foreground block">
                {t(stat.key as Parameters<typeof t>[0])}
              </TypographySmall>
              <div className="mx-auto mt-3 h-0.5 w-8 origin-center scale-x-0 rounded-full gradient-bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </SpotlightCard>
          </AnimateIn>
        ))}
      </div>
    </section>
  )
}
