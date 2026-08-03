"use client"

import { useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  CreditCard,
  Headphones,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { PaperGrid } from "@/components/utils/paper-grid"

const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@apsaraelearning.com"

const CHANNELS = [
  { key: "email", icon: Mail, href: `mailto:${SUPPORT_EMAIL}` },
  { key: "help", icon: BookOpenCheck, href: "/support" },
  { key: "billing", icon: CreditCard, href: "/pricing" },
  { key: "privacy", icon: LockKeyhole, href: "/privacy" },
] as const

const CATEGORY_KEYS = [
  "account",
  "learning",
  "aiTutor",
  "billing",
  "privacy",
  "other",
] as const

export function ContactPageContent() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [draftOpened, setDraftOpened] = useState(false)
  const t = useTranslations("contactPage")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const category = String(form.get("category") ?? "")
    const subject = String(form.get("subject") ?? "")
    const name = String(form.get("name") ?? "")
    const email = String(form.get("email") ?? "")
    const message = String(form.get("message") ?? "")

    const mailSubject = `[Apsara ${category}] ${subject}`
    const mailBody = [
      `${t("form.name")}: ${name}`,
      `${t("form.email")}: ${email}`,
      `${t("form.category")}: ${category}`,
      "",
      message,
    ].join("\n")

    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    setDraftOpened(true)
  }

  return (
    <div className="landing-page relative min-h-screen overflow-x-hidden text-foreground">
      <PaperGrid />
      <LandingNavbar
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />

      <main className="relative z-10 px-5 pb-24 pt-28 sm:px-6 sm:pt-32">
        <section className="mx-auto max-w-7xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#2383e2]/20 bg-background/80 px-4 py-2 text-sm font-medium text-[#1769b5] shadow-sm backdrop-blur-sm dark:text-[#76baff]">
            <Headphones className="size-4" />
            {t("eyebrow")}
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {t("subtitle")}
          </p>
        </section>

        <section className="mx-auto mt-10 grid max-w-7xl gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CHANNELS.map(({ key, icon: Icon, href }) => (
            <Link
              key={key}
              href={href}
              className="landing-interactive-card group rounded-[1.5rem] border border-border bg-background/90 p-5 shadow-[0_18px_50px_-40px_rgba(31,77,145,0.4)] backdrop-blur-sm"
            >
              <div className="mb-5 flex items-start justify-between gap-3">
                <div className="landing-card-icon flex size-11 items-center justify-center rounded-2xl bg-[#2383e2]/10 text-[#2383e2]">
                  <Icon className="size-5" />
                </div>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-[#2383e2]" />
              </div>
              <h2 className="font-semibold">{t(`channels.${key}.title`)}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {t(`channels.${key}.body`, { email: SUPPORT_EMAIL })}
              </p>
            </Link>
          ))}
        </section>

        <section className="mx-auto mt-10 grid max-w-7xl overflow-hidden rounded-[2rem] border border-border bg-background/95 shadow-[0_28px_80px_-52px_rgba(31,77,145,0.42)] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative overflow-hidden bg-linear-to-br from-[#1675d1] via-[#2369ca] to-[#3154bd] p-7 text-white sm:p-10 lg:p-12">
            <div
              aria-hidden
              className="absolute -right-28 -top-28 size-72 rounded-full border border-white/15"
            />
            <div
              aria-hidden
              className="absolute -bottom-32 -left-24 size-72 rounded-full bg-cyan-300/10 blur-2xl"
            />
            <div className="relative">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/12">
                <MessageSquareText className="size-6" />
              </div>
              <h2 className="mt-8 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {t("panel.title")}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-white/75 sm:text-base">
                {t("panel.body")}
              </p>

              <div className="mt-9 space-y-4">
                {["details", "security", "reply"].map((key, index) => {
                  const icons = [Sparkles, ShieldCheck, CheckCircle2]
                  const Icon = icons[index]
                  return (
                    <div key={key} className="flex gap-3">
                      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/12 text-cyan-100">
                        <Icon className="size-4" />
                      </div>
                      <p className="text-sm leading-6 text-white/80">
                        {t(`panel.points.${key}`)}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-7">
              <p className="text-sm font-semibold text-[#2383e2]">
                {t("form.eyebrow")}
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {t("form.title")}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {t("form.note")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2 text-sm font-medium">
                  <span>{t("form.name")}</span>
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder={t("form.namePlaceholder")}
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#2383e2]/60 focus:ring-4 focus:ring-[#2383e2]/10"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>{t("form.email")}</span>
                  <input
                    name="email"
                    required
                    type="email"
                    autoComplete="email"
                    placeholder={t("form.emailPlaceholder")}
                    className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#2383e2]/60 focus:ring-4 focus:ring-[#2383e2]/10"
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium">
                <span>{t("form.category")}</span>
                <select
                  name="category"
                  required
                  defaultValue=""
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#2383e2]/60 focus:ring-4 focus:ring-[#2383e2]/10"
                >
                  <option value="" disabled>
                    {t("form.categoryPlaceholder")}
                  </option>
                  {CATEGORY_KEYS.map((key) => (
                    <option key={key} value={t(`form.categories.${key}`)}>
                      {t(`form.categories.${key}`)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm font-medium">
                <span>{t("form.subject")}</span>
                <input
                  name="subject"
                  required
                  placeholder={t("form.subjectPlaceholder")}
                  className="h-12 w-full rounded-xl border border-border bg-background px-4 text-sm outline-none transition focus:border-[#2383e2]/60 focus:ring-4 focus:ring-[#2383e2]/10"
                />
              </label>

              <label className="block space-y-2 text-sm font-medium">
                <span>{t("form.message")}</span>
                <textarea
                  name="message"
                  required
                  rows={6}
                  placeholder={t("form.messagePlaceholder")}
                  className="min-h-36 w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#2383e2]/60 focus:ring-4 focus:ring-[#2383e2]/10"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">
                  {t("form.privacyNote")}
                </p>
                <button
                  type="submit"
                  className="landing-action inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#1675d1] to-[#3154bd] px-6 text-sm font-semibold text-white shadow-lg shadow-[#2383e2]/20"
                >
                  {t("form.submit")}
                  <Send className="size-4" />
                </button>
              </div>

              {draftOpened && (
                <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                  {t("form.draftOpened")}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
