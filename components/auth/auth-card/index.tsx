"use client"

import type { ReactNode } from "react"
import { Bot, BookOpen, GraduationCap } from "lucide-react"
import { useTranslations } from "next-intl"
import { BrandLogo } from "@/components/utils/brand-logo"
import { cn } from "@/lib/utils"

interface AuthCardProps {
  title: string
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: "default" | "wide"
  className?: string
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  size = "default",
  className,
}: AuthCardProps) {
  const t = useTranslations("auth")

  const highlights = [
    { icon: BookOpen, label: t("experienceFeatureLessons") },
    { icon: Bot, label: t("experienceFeatureAi") },
    { icon: GraduationCap, label: t("experienceFeatureFree") },
  ]

  return (
    <main
      className={cn(
        "auth-card",
        size === "wide" && "auth-card-wide",
        className
      )}
    >
      <aside className="auth-card-showcase">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-24 size-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-20 -right-24 size-72 rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="absolute bottom-20 left-10 size-40 rounded-full border border-white/[0.07]" />
        </div>

        <div className="relative flex h-full flex-col justify-center">
          <div>
            <h2 className="max-w-sm text-3xl font-bold leading-tight tracking-[-0.035em] text-white">
              {t("experienceTitle")}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-blue-100/75">
              {t("experienceDescription")}
            </p>

            <div className="mt-6 space-y-2">
              {highlights.map(({ icon: HighlightIcon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 text-xs font-medium text-blue-50/90 backdrop-blur-sm">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
                    <HighlightIcon className="size-3.5" />
                  </div>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="auth-card-form">
        <div
          aria-hidden
          className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/80 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10"
        />

        <div className="auth-card-form-logo relative mb-5">
          <BrandLogo size="sm" />
        </div>

        <header className="relative text-left">
          <h1 className="text-[1.55rem] font-bold tracking-[-0.03em] text-foreground">
            {title}
          </h1>
          {subtitle && (
            <div className="auth-card-subtitle mt-1.5 max-w-md text-sm leading-5 text-muted-foreground">
              {subtitle}
            </div>
          )}
        </header>

        <div className="auth-card-content relative mt-5">{children}</div>

        {footer && (
          <footer className="auth-card-footer relative mt-5 border-t border-border/80 pt-4 text-center text-sm text-muted-foreground">
            {footer}
          </footer>
        )}
      </section>
    </main>
  )
}
