"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowRight,
  Bot,
  ChevronDown,
  CircleHelp,
  CreditCard,
  KeyRound,
  LockKeyhole,
  Mail,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { PaperGrid } from "@/components/utils/paper-grid"

const CATEGORY_KEYS = ["all", "account", "learning", "ai", "billing", "privacy"] as const
type CategoryKey = (typeof CATEGORY_KEYS)[number]

type FaqItem = {
  category: Exclude<CategoryKey, "all">
  question: string
  answer: string
}

const CATEGORY_ICONS = [CircleHelp, UserRound, Sparkles, Bot, CreditCard, LockKeyhole]

const QUICK_LINKS = [
  { key: "password", href: "/forgot-password", icon: KeyRound },
  { key: "plans", href: "/pricing", icon: CreditCard },
  { key: "tutor", href: "/tutor", icon: Bot },
  { key: "contact", href: "/contact", icon: Mail },
] as const

export function SupportPageContent() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryKey>("all")
  const t = useTranslations("supportPage")
  const faqs = t.raw("faqs") as FaqItem[]

  const filteredFaqs = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return faqs.filter((faq) => {
      const categoryMatches = category === "all" || faq.category === category
      const queryMatches =
        !normalized ||
        `${faq.question} ${faq.answer}`.toLocaleLowerCase().includes(normalized)
      return categoryMatches && queryMatches
    })
  }, [category, faqs, query])

  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden text-foreground">
      <PaperGrid />
      <LandingNavbar
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />

      <main className="relative z-10 pb-24 pt-16">
        <section className="relative overflow-hidden px-5 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20">
          <div
            aria-hidden
            className="absolute left-1/2 top-0 size-[36rem] -translate-x-1/2 rounded-full bg-[#2383e2]/9 blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#2383e2]/20 bg-background/80 px-4 py-2 text-sm font-medium text-[#1769b5] shadow-sm backdrop-blur-sm dark:text-[#76baff]">
              <CircleHelp className="size-4" />
              {t("eyebrow")}
            </div>
            <h1 className="mt-6 text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
              {t("subtitle")}
            </p>

            <div className="relative mx-auto mt-8 max-w-2xl">
              <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchLabel")}
                className="h-14 w-full rounded-2xl border border-border bg-background/95 pl-13 pr-12 text-sm shadow-[0_18px_50px_-34px_rgba(31,77,145,0.42)] outline-none backdrop-blur-sm transition focus:border-[#2383e2]/60 focus:ring-4 focus:ring-[#2383e2]/10 sm:h-16 sm:text-base"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("clearSearch")}
                  className="absolute right-4 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_LINKS.map(({ key, href, icon: Icon }) => (
              <Link
                key={key}
                href={href}
                className="landing-interactive-card group rounded-[1.4rem] border border-border bg-background/92 p-5 shadow-[0_16px_45px_-38px_rgba(31,77,145,0.4)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="landing-card-icon flex size-10 items-center justify-center rounded-xl bg-[#2383e2]/10 text-[#2383e2]">
                    <Icon className="size-5" />
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-[#2383e2]" />
                </div>
                <h2 className="mt-5 font-semibold">{t(`quickLinks.${key}.title`)}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(`quickLinks.${key}.body`)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-7xl px-5 sm:px-6">
          <div className="grid items-start gap-8 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24">
              <p className="mb-4 px-1 text-sm font-semibold">{t("categoriesTitle")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {CATEGORY_KEYS.map((key, index) => {
                  const Icon = CATEGORY_ICONS[index]
                  const active = category === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setCategory(key)}
                      aria-pressed={active}
                      className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                        active
                          ? "border-[#2383e2]/30 bg-[#2383e2]/10 font-semibold text-[#1769b5] dark:text-[#76baff]"
                          : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/55 hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      {t(`categories.${key}`)}
                    </button>
                  )
                })}
              </div>
            </aside>

            <div>
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-[#2383e2]">{t("faqEyebrow")}</p>
                  <h2 className="mt-1 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                    {t("faqTitle")}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("results", { count: filteredFaqs.length })}
                </p>
              </div>

              {filteredFaqs.length > 0 ? (
                <div className="space-y-3">
                  {filteredFaqs.map((faq) => (
                    <details
                      key={faq.question}
                      className="group overflow-hidden rounded-[1.35rem] border border-border bg-background/92 shadow-[0_14px_40px_-36px_rgba(31,77,145,0.38)] open:border-[#2383e2]/25"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-5 py-5 font-semibold marker:content-none sm:px-6 [&::-webkit-details-marker]:hidden">
                        <span>{faq.question}</span>
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground transition group-open:rotate-180 group-open:bg-[#2383e2]/10 group-open:text-[#2383e2]">
                          <ChevronDown className="size-4" />
                        </span>
                      </summary>
                      <div className="border-t border-border px-5 py-5 text-sm leading-7 text-muted-foreground sm:px-6 sm:text-base">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border bg-muted/25 px-6 py-14 text-center">
                  <Search className="mx-auto size-7 text-muted-foreground" />
                  <h3 className="mt-4 font-semibold">{t("emptyTitle")}</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    {t("emptyBody")}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("")
                      setCategory("all")
                    }}
                    className="landing-action mt-5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                  >
                    {t("resetFilters")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-7xl px-5 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-[#1675d1] to-[#3154bd] px-6 py-9 text-white sm:flex sm:items-center sm:justify-between sm:gap-8 sm:px-10 sm:py-10">
            <div aria-hidden className="absolute -right-20 -top-28 size-72 rounded-full border border-white/15" />
            <div className="relative flex gap-4">
              <div className="hidden size-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 sm:flex">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">{t("contactCta.title")}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">
                  {t("contactCta.body")}
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className="landing-action relative mt-6 inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#1769b5] shadow-lg shadow-black/10 sm:mt-0"
            >
              {t("contactCta.button")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
