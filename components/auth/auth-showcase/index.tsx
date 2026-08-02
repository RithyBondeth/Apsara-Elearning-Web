"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/utils/brand-logo"

interface AuthShowcaseProps {
  icon: React.ReactNode
  title: string
  description: string
  children?: React.ReactNode
  side?: "left" | "right"
  className?: string
}

export function AuthShowcase({
  icon,
  title,
  description,
  children,
  side = "right",
  className,
}: AuthShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const t = useTranslations("auth")

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      gsap.from("[data-showcase-item]", {
        opacity: 0,
        y: 24,
        duration: 0.75,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.2,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <aside
      ref={rootRef}
      data-side={side}
      className={cn(
        "auth-showcase-panel relative hidden w-[44%] shrink-0 overflow-hidden lg:flex",
        className
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 size-80 rounded-full border border-white/10" />
        <div className="absolute -left-16 -top-16 size-52 rounded-full border border-white/10" />
        <div className="absolute -bottom-36 -right-28 size-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="relative flex w-full flex-col p-9 text-white xl:p-11">
        <div data-showcase-item className="flex items-center justify-between">
          <BrandLogo size="sm" className="[&_span]:!text-white" />
          <div className="flex size-9 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Sparkles className="size-4 text-cyan-200" />
          </div>
        </div>

        <div className="my-auto py-12">
          <div
            data-showcase-item
            className="mb-7 flex size-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_20px_55px_-24px_rgba(96,165,250,0.85)] backdrop-blur-md"
          >
            {icon}
          </div>

          <div data-showcase-item>
            <h2 className="max-w-sm text-3xl font-bold leading-tight">
              {title}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-blue-100/72">
              {description}
            </p>
          </div>

          {children && (
            <div data-showcase-item className="mt-8 w-full max-w-sm">
              {children}
            </div>
          )}
        </div>

        <div
          data-showcase-item
          className="flex items-center gap-2 text-xs text-blue-100/55"
        >
          <span className="size-1.5 rounded-full bg-emerald-300" />
          {t("showcaseFooter")}
        </div>
      </div>
    </aside>
  )
}
