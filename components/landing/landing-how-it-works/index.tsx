"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { SpotlightCard } from "@/components/utils/animations/spotlight-card"
import { HOW_IT_WORKS, COLOR } from "@/utils/constants/landing.constant"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyLead } from "@/components/utils/typography/typography-lead"
import { TypographyP } from "@/components/utils/typography/typography-p"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

export function LandingHowItWorks() {
  const t = useTranslations("howItWorks")
  const lineRef = useRef<HTMLDivElement>(null)

  /* Connector line draws itself left → right as the section scrolls in */
  useEffect(() => {
    const line = lineRef.current
    if (!line) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const tween = gsap.fromTo(
      line,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: line,
          start: "top 85%",
          end: "top 40%",
          scrub: 0.5,
        },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <section id="how-it-works" className="py-28 px-6 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        <AnimateIn animation="fade-up" className="text-center mb-16">
          <TypographyH2 className="text-4xl font-bold tracking-tight mb-4 text-foreground border-0 pb-0">
            {t("headingPart1")}{" "}
            <span className="gradient-text-animated">{t("headingHighlight")}</span>{" "}
            {t("headingPart2")}
          </TypographyH2>
          <TypographyLead>{t("subheading")}</TypographyLead>
        </AnimateIn>

        <div className="relative">
          {/* Scroll-drawn connector line behind the cards */}
          <div className="absolute top-14 left-[12%] right-[12%] hidden md:block">
            <div className="h-px w-full bg-border" />
            <div
              ref={lineRef}
              className="absolute inset-0 h-px origin-left scale-x-0 bg-gradient-to-r from-[#2383e2] via-[#7c5cff] to-[#22c9dd]"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => {
              const c = COLOR[item.color]
              const key = item.key as Parameters<typeof t>[0]
              return (
                <AnimateIn key={item.step} animation="flip-up" delay={i * 0.18}>
                  <SpotlightCard className="landing-interactive-card group card-surface relative h-full rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="gradient-text text-5xl font-black opacity-25 transition-opacity duration-300 group-hover:opacity-60 select-none">
                        {item.step}
                      </span>
                      <div className={`landing-card-icon flex size-10 items-center justify-center rounded-xl border ${c.bg} ${c.border}`}>
                        <item.icon className={`size-5 ${c.icon}`} />
                      </div>
                    </div>
                    <TypographyH4 className="text-foreground mb-2">
                      {t(`${key}.title` as Parameters<typeof t>[0])}
                    </TypographyH4>
                    <TypographyP className="text-sm text-muted-foreground leading-relaxed">
                      {t(`${key}.desc` as Parameters<typeof t>[0])}
                    </TypographyP>
                  </SpotlightCard>
                </AnimateIn>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
