"use client"

import { Star } from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Marquee } from "@/components/utils/animations/marquee"
import { TESTIMONIALS } from "@/utils/constants/landing.constant"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyBlockquote } from "@/components/utils/typography/typography-blockquote"
import { TypographySmall } from "@/components/utils/typography/typography-small"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"

function TestimonialCard({ itemKey, avatar, stars }: { itemKey: string; avatar: string; stars: number }) {
  const t = useTranslations("testimonials")
  const key = itemKey as Parameters<typeof t>[0]

  return (
    <div className="landing-interactive-card card-surface flex w-80 shrink-0 flex-col rounded-2xl p-6">
      <div className="flex gap-0.5 mb-4">
        {[...Array(stars)].map((_, j) => (
          <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <TypographyBlockquote className="mt-0 border-l-violet-300 dark:border-l-violet-500/40 text-muted-foreground text-sm leading-relaxed mb-6 flex-1">
        {t(`${key}.text` as Parameters<typeof t>[0])}
      </TypographyBlockquote>
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl gradient-bg-primary flex items-center justify-center text-sm font-bold text-white shrink-0">
          {avatar}
        </div>
        <div>
          <TypographySmall className="font-semibold text-foreground block">
            {t(`${key}.name` as Parameters<typeof t>[0])}
          </TypographySmall>
          <TypographyMuted className="text-xs opacity-70">
            {t(`${key}.role` as Parameters<typeof t>[0])}
          </TypographyMuted>
        </div>
      </div>
    </div>
  )
}

export function LandingTestimonials() {
  const t = useTranslations("testimonials")

  return (
    <section id="testimonials" className="landing-section-tinted scroll-mt-20 overflow-hidden py-28">
      <div className="max-w-6xl mx-auto px-6">
        <AnimateIn animation="fade-up" className="text-center mb-16">
          <TypographyH2 className="text-4xl font-bold tracking-tight mb-4 text-foreground border-0 pb-0">
            {t("headingPart1")}{" "}
            <span className="gradient-text-animated">{t("headingHighlight")}</span>
            {t("headingPart2") ? ` ${t("headingPart2")}` : ""}
          </TypographyH2>
        </AnimateIn>
      </div>

      {/* Two counter-scrolling marquee rows; hover a row to pause it */}
      <AnimateIn animation="fade" className="space-y-5">
        <Marquee duration={38}>
          {[...TESTIMONIALS, ...TESTIMONIALS].map((item, i) => (
            <TestimonialCard key={`${item.key}-${i}`} itemKey={item.key} avatar={item.avatar} stars={item.stars} />
          ))}
        </Marquee>
        <Marquee duration={46} direction="right">
          {[...TESTIMONIALS, ...TESTIMONIALS].reverse().map((item, i) => (
            <TestimonialCard key={`${item.key}-${i}`} itemKey={item.key} avatar={item.avatar} stars={item.stars} />
          ))}
        </Marquee>
      </AnimateIn>
    </section>
  )
}
