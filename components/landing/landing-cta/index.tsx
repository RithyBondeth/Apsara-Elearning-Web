"use client"

import Link from "next/link"
import {
  ArrowRight,
  Atom,
  Bot,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Users,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { MokotMark } from "@/components/utils/brand-logo"

export function LandingCta() {
  const t = useTranslations("cta")

  const trustItems = [
    { icon: Users, label: t("trustStudents") },
    { icon: GraduationCap, label: t("trustLevels") },
    { icon: Bot, label: t("trustAi") },
  ]

  return (
    <section className="px-6 py-24 md:py-28">
      <AnimateIn animation="fade-up" className="mx-auto max-w-6xl">
        <div className="landing-cta-new relative isolate overflow-hidden rounded-[2rem] border border-border bg-card/90 shadow-[0_30px_90px_-44px_rgba(35,104,207,0.42)] backdrop-blur-xl">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="grid-pattern grid-mask-radial absolute inset-0 opacity-45 dark:opacity-25" />
            <div className="absolute -left-24 -top-36 size-80 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="absolute bottom-[-45%] left-[32%] size-96 rounded-full bg-cyan-400/10 blur-3xl" />
            <span className="absolute left-[5%] top-[12%] text-4xl font-bold text-blue-500/10">π</span>
            <Atom className="absolute bottom-[9%] left-[45%] size-12 text-cyan-500/10" />
            <span className="absolute right-[43%] top-[10%] text-3xl font-bold text-amber-500/10">ក</span>
          </div>

          <div className="relative grid lg:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)]">
            <div className="flex flex-col justify-center px-7 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:border-blue-400/15 dark:bg-blue-400/10 dark:text-blue-300">
                <BookOpen className="size-3.5" />
                {t("eyebrow")}
              </div>

              <h2 className="max-w-3xl text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl md:text-5xl">
                {t("headingPart1")} {" "}
                <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-cyan-300">
                  {t("headingHighlight")}
                </span>
                {t("headingPart2")}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                {t("subheading")}
              </p>

              <div className="mt-8 grid gap-2.5 sm:grid-cols-3">
                {trustItems.map(({ icon: TrustIcon, label }) => (
                  <div
                    key={label}
                    className="landing-interactive-card flex items-center gap-2.5 rounded-xl border border-border/80 bg-background/70 px-3 py-3 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                      <TrustIcon className="size-3.5" />
                    </div>
                    <span className="leading-4">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative p-3 sm:p-4 lg:p-5 lg:pl-0">
              <div className="relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[1.6rem] border border-blue-300/20 bg-gradient-to-br from-[#156ecf] via-[#225dc0] to-[#4145a8] p-7 text-white shadow-[0_24px_60px_-30px_rgba(29,78,216,0.78)] sm:p-8">
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.6rem]">
                  <div className="absolute -right-20 -top-24 size-60 rounded-full border border-white/10" />
                  <div className="absolute -bottom-24 -left-20 size-64 rounded-full bg-cyan-300/10 blur-3xl" />
                </div>

                <div className="relative flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2 shadow-lg backdrop-blur-sm">
                  <MokotMark className="size-full" />
                </div>

                <div className="relative my-auto py-8">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {t("cardTitle")}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-blue-100/78">
                    {t("cardBody")}
                  </p>
                  <div className="mt-5 flex items-start gap-2 text-sm leading-6 text-blue-50/88">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-emerald-300" />
                    <span>{t("finePrint")}</span>
                  </div>
                </div>

                <div className="relative space-y-2.5">
                  <Link
                    href="/register"
                    className="landing-action group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-blue-700 shadow-lg hover:-translate-y-0.5 hover:bg-blue-50"
                  >
                    {t("createAccount")}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/courses"
                    className="landing-action inline-flex min-h-10 w-full items-center justify-center rounded-xl text-sm font-semibold text-blue-100 hover:bg-white/10 hover:text-white"
                  >
                    {t("exploreCourses")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimateIn>
    </section>
  )
}
