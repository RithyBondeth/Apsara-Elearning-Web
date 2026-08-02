"use client"

import Link from "next/link"
import { Sparkles, ArrowRight, Globe } from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Magnetic } from "@/components/utils/animations/magnetic"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyLead } from "@/components/utils/typography/typography-lead"
import { TypographySmall } from "@/components/utils/typography/typography-small"

export function LandingCta() {
  const t = useTranslations("cta")

  return (
    <section className="px-6 py-28">
      <AnimateIn animation="zoom" className="mx-auto max-w-3xl text-center">
        {/* Rotating conic beam traces the card border */}
        <div className="border-beam rounded-3xl">
          <div className="border-beam-content relative overflow-hidden rounded-3xl p-12">
            {/* Inner aurora wash */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="aurora-orb aurora-blue size-72 -top-24 -left-16" />
              <div className="aurora-orb aurora-violet size-72 -bottom-24 -right-16" style={{ animationDelay: "-10s" }} />
              <div className="grid-pattern grid-mask-radial absolute inset-0" />
            </div>
            <div className="relative">
              <div className="mb-6">
                <div className="relative mx-auto size-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl gradient-bg-primary opacity-15 animate-breathe" />
                  <Globe className="size-12 text-blue-500/70 animate-float" />
                </div>
              </div>
              <TypographyH2 className="text-4xl font-bold tracking-tight mb-4 text-foreground border-0 pb-0">
                {t("headingPart1")}{" "}
                <span className="gradient-text-animated">{t("headingHighlight")}</span>
                {t("headingPart2")}
              </TypographyH2>
              <TypographyLead className="mb-8">
                {t("subheading")}
                <br />
                {t("free")}
              </TypographyLead>
              <Magnetic>
                <Link href="/register">
                  <button className="btn-shine gradient-bg-primary group inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:shadow-[0_0_40px_-8px_rgba(35,131,226,0.7)]">
                    <Sparkles className="size-5" />
                    {t("createAccount")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
              </Magnetic>
              <TypographySmall className="mt-4 block text-muted-foreground">
                {t("finePrint")}
              </TypographySmall>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  )
}
