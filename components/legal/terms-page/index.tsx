"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenCheck,
  Check,
  FileText,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { PaperGrid } from "@/components/utils/paper-grid"

const SECTION_KEYS = [
  "acceptance",
  "eligibility",
  "services",
  "accounts",
  "acceptableUse",
  "content",
  "billing",
  "cancellation",
  "availability",
  "termination",
  "disclaimers",
  "law",
  "changes",
  "contact",
] as const

type SectionKey = (typeof SECTION_KEYS)[number]

type SectionContent = {
  paragraphs: string[]
  bullets: string[]
}

const SECTION_ICONS = [BookOpenCheck, ShieldCheck, Sparkles, Scale]

export function TermsPageContent() {
  const [menuOpen, setMenuOpen] = useState(false)
  const t = useTranslations("termsPage")

  const getSection = (key: SectionKey) =>
    t.raw(`sections.${key}`) as SectionContent

  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden text-foreground">
      <PaperGrid />
      <LandingNavbar
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />

      <main className="relative z-10 px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
        <section className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-background/88 px-6 py-10 shadow-[0_28px_80px_-48px_rgba(35,131,226,0.42)] backdrop-blur-sm sm:px-10 sm:py-14 lg:px-14">
            <div
              aria-hidden
              className="absolute -right-24 -top-28 size-80 rounded-full bg-[#2383e2]/10 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 left-1/3 size-64 rounded-full bg-[#7c5cff]/10 blur-3xl"
            />

            <div className="relative grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2383e2]/20 bg-[#2383e2]/8 px-3.5 py-2 text-sm font-medium text-[#1769b5] dark:text-[#76baff]">
                  <FileText className="size-4" />
                  {t("eyebrow")}
                </div>
                <h1 className="max-w-4xl text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                  {t("title")}
                </h1>
                <p className="mt-5 max-w-3xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
                  {t("intro")}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-border bg-muted/55 px-4 py-2 text-sm font-medium">
                    {t("effectiveDate")}
                  </span>
                  <Link
                    href="/"
                    className="landing-action inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ArrowLeft className="size-4" />
                    {t("backHome")}
                  </Link>
                </div>
              </div>

              <div className="hidden rounded-[1.75rem] border border-[#2383e2]/16 bg-gradient-to-br from-[#2383e2]/10 via-background/85 to-[#7c5cff]/10 p-5 lg:block">
                <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#2383e2] text-white shadow-lg shadow-[#2383e2]/20">
                  <ShieldCheck className="size-6" />
                </div>
                <p className="text-sm font-semibold">{t("summaryTitle")}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t("summaryBody")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-10 grid max-w-7xl items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24">
            <div className="rounded-[1.5rem] border border-border bg-background/92 p-4 shadow-[0_18px_50px_-38px_rgba(31,77,145,0.35)] backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2 px-3 pt-2 text-sm font-semibold">
                <Scale className="size-4 text-[#2383e2]" />
                {t("toc")}
              </div>
              <nav aria-label={t("toc")} className="max-h-[calc(100vh-12rem)] overflow-y-auto pr-1">
                {SECTION_KEYS.map((key, index) => (
                  <a
                    key={key}
                    href={`#${key}`}
                    className="group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  >
                    <span className="mt-0.5 min-w-5 font-mono text-[11px] text-[#2383e2]/75">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="leading-5">
                      {t(`sections.${key}.title`)}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <article className="overflow-hidden rounded-[2rem] border border-border bg-background/95 shadow-[0_24px_70px_-48px_rgba(31,77,145,0.32)]">
            <div className="border-b border-border bg-muted/35 px-6 py-5 sm:px-10">
              <p className="flex items-center gap-2 text-sm leading-6 text-muted-foreground">
                <Check className="size-4 shrink-0 text-emerald-500" />
                {t("readingNote")}
              </p>
            </div>

            <div className="divide-y divide-border px-6 sm:px-10">
              {SECTION_KEYS.map((key, index) => {
                const section = getSection(key)
                const Icon = SECTION_ICONS[index % SECTION_ICONS.length]

                return (
                  <section
                    id={key}
                    key={key}
                    className="scroll-mt-24 py-9 sm:py-11"
                  >
                    <div className="grid gap-5 sm:grid-cols-[3rem_minmax(0,1fr)]">
                      <div className="flex size-11 items-center justify-center rounded-2xl border border-[#2383e2]/15 bg-[#2383e2]/8 text-[#2383e2]">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <div className="mb-4 flex items-baseline gap-3">
                          <span className="font-mono text-xs text-[#2383e2]/75">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h2 className="text-xl font-bold tracking-[-0.02em] sm:text-2xl">
                            {t(`sections.${key}.title`)}
                          </h2>
                        </div>

                        <div className="space-y-4 text-[15px] leading-7 text-muted-foreground sm:text-base sm:leading-7">
                          {section.paragraphs.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                          {section.bullets.length > 0 && (
                            <ul className="space-y-3 pt-1">
                              {section.bullets.map((bullet) => (
                                <li key={bullet} className="flex gap-3">
                                  <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[#2383e2]" />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>
                )
              })}
            </div>

            <div className="m-4 rounded-[1.5rem] bg-gradient-to-br from-[#1675d1] to-[#3154bd] p-6 text-white sm:m-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
              <div>
                <p className="font-semibold">{t("closingTitle")}</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                  {t("closingBody")}
                </p>
              </div>
              <Link
                href="/register"
                className="landing-action mt-5 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1769b5] shadow-lg shadow-black/10 sm:mt-0"
              >
                {t("createAccount")}
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </article>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
