"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"

export function LandingCta() {
  const t = useTranslations("cta")

  return (
    <section className="px-6 py-24 md:py-28">
      <AnimateIn animation="fade-up" className="mx-auto max-w-6xl">
        <div className="landing-cta-panel overflow-hidden rounded-[2rem] border border-blue-300/20 p-2 shadow-[0_28px_80px_-34px_rgba(24,83,184,0.72)] sm:p-3">
          <div className="relative grid overflow-hidden rounded-[1.55rem] lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden"
            >
              <div className="absolute -left-28 -top-40 size-96 rounded-full bg-cyan-300/10 blur-3xl" />
              <div className="absolute bottom-0 left-[42%] top-0 w-px bg-white/10" />
              <div className="absolute -bottom-36 left-[34%] size-80 rounded-full border border-white/10" />
            </div>

            <div className="relative px-7 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50 backdrop-blur-sm">
                <Sparkles className="size-3.5 text-cyan-200" />
                {t("free")}
              </div>

              <h2 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                {t("headingPart1")}{" "}
                <span className="text-cyan-200">
                  {t("headingHighlight")}
                </span>
                {t("headingPart2")}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/80 md:text-lg">
                {t("subheading")}
              </p>
            </div>

            <div className="relative m-1.5 flex flex-col justify-center rounded-[1.35rem] border border-white/70 bg-white p-7 shadow-2xl sm:m-2 sm:p-8 lg:m-3 lg:p-9">
              <div className="mb-6 flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Sparkles className="size-5" />
              </div>

              <p className="text-sm font-bold text-blue-700">{t("free")}</p>
              <div className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-slate-600">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <span>{t("finePrint")}</span>
              </div>

              <Link
                href="/register"
                className="landing-action btn-shine group mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-6 text-base font-bold text-white shadow-lg hover:bg-blue-700"
              >
                {t("createAccount")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  )
}
