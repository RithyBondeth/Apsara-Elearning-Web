"use client"

import Link from "next/link"
import { BookOpen, ChevronRight, Calculator, Atom, Languages, ArrowRight } from "lucide-react"

const ICON_MAP: Record<string, React.ElementType> = {
  Calculator,
  Atom,
  Languages,
}
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { FEATURED_SUBJECTS, COLOR } from "@/utils/constants/landing.constant"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"

export function LandingCourses() {
  const t = useTranslations("courses")

  return (
    <section id="courses" className="landing-section-tinted scroll-mt-20 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <AnimateIn animation="fade-up" className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/25 text-xs text-cyan-700 dark:text-cyan-300 mb-4 font-medium">
                <BookOpen className="size-3" />
                {t("badge")}
              </div>
              <TypographyH2 className="text-4xl font-bold tracking-tight text-foreground border-0 pb-0">
                {t("headingPart1")}{" "}
                <span className="gradient-text-animated">{t("headingHighlight")}</span>
                {t("headingPart2") ? ` ${t("headingPart2")}` : ""}
              </TypographyH2>
            </div>
            <Link href="/dashboard">
              <button className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("viewAll")}
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </AnimateIn>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURED_SUBJECTS.map((subject, i) => {
            const c = COLOR[subject.color]
            const key = subject.key as Parameters<typeof t>[0]
            return (
              <AnimateIn
                key={subject.key}
                animation={i === 0 ? "fade-right" : i === 1 ? "zoom" : "fade-left"}
                delay={i * 0.12}
              >
                  <div className={`landing-interactive-card group card-surface btn-shine flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border ${c.border}`}>
                    {/* Animated top gradient bar */}
                    <div className="animate-gradient h-1 w-full bg-gradient-to-r from-[#2383e2] via-[#7c5cff] to-[#22c9dd] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`landing-card-icon flex size-14 items-center justify-center rounded-2xl ${c.bg}`}>
                          {(() => {
                            const Icon = ICON_MAP[subject.icon]
                            return Icon ? <Icon className={`size-7 ${c.icon}`} /> : null
                          })()}
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {t(`${key}.tag` as Parameters<typeof t>[0])}
                        </span>
                      </div>
                      <TypographyH3 className="text-foreground text-lg mb-3">
                        {t(`${key}.title` as Parameters<typeof t>[0])}
                      </TypographyH3>
                      <div className="flex items-center gap-3 mb-5">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${subject.levelBadge}`}>
                          {subject.level}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {t("lessons", { count: subject.lessons })}
                        </span>
                        <span className={`text-xs font-semibold ${c.icon}`}>+{subject.xp} XP</span>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <button className="landing-action group/btn flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground/70 hover:text-foreground">
                        {t("startCourse")}
                        <ArrowRight className="size-3.5 -ml-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />
                      </button>
                    </div>
                  </div>
              </AnimateIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}
