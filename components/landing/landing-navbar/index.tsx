"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ThemeToggle } from "@/components/utils/themes/theme-toggle"
import { LanguageSwitcher } from "@/components/utils/language-switcher"
import { BrandLogo } from "@/components/utils/brand-logo"
import { NAV_LINKS } from "@/utils/constants/landing.constant"
import { cn } from "@/lib/utils"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface LandingNavbarProps {
  menuOpen: boolean
  onMenuToggle: () => void
}

export function LandingNavbar({ menuOpen, onMenuToggle }: LandingNavbarProps) {
  const t = useTranslations("nav")
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  /* Elevate the bar once the page scrolls */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* Slide the whole bar in from the top on first load */
  useEffect(() => {
    const el = navRef.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.fromTo(
      el,
      { y: -72, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 }
    )
  }, [])

  /* Scroll progress beam along the bottom edge */
  useEffect(() => {
    const bar = progressRef.current
    if (!bar) return
    const tween = gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
      }
    )
    return () => {
      tween.scrollTrigger?.kill()
      tween.kill()
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border bg-background/75 backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(35,131,226,0.15)]"
          : "border-b border-transparent bg-background/55 backdrop-blur-md"
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto px-6 flex items-center justify-between gap-4 transition-all duration-300",
          scrolled ? "h-14" : "h-16"
        )}
      >
        <BrandLogo />

        <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
          {NAV_LINKS.map((nav) => (
            <a
              key={nav.key}
              href={nav.href}
              className="group relative px-4 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            >
              {t(nav.key)}
              <span className="absolute inset-x-4 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full gradient-bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
          >
            {t("signIn")}
          </Link>
          <Link href="/register">
            <button className="landing-action btn-shine rounded-xl gradient-bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              {t("startFree")} →
            </button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher size="sm" />
          <ThemeToggle size="sm" />
          <button
            className="p-2 text-muted-foreground hover:text-foreground"
            onClick={onMenuToggle}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Scroll progress beam */}
      <div
        ref={progressRef}
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-[#2383e2] via-[#7c5cff] to-[#22c9dd]"
      />

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl animate-scale-in">
          <div className="px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((nav) => (
              <a
                key={nav.key}
                href={nav.href}
                className="py-2.5 text-sm text-muted-foreground hover:text-foreground hover:translate-x-1 transition-all"
              >
                {t(nav.key)}
              </a>
            ))}
            <div className="pt-3 border-t border-border flex flex-col gap-2 mt-1">
              <Link href="/login" className="py-2 text-sm text-muted-foreground">
                {t("signIn")}
              </Link>
              <Link href="/register">
                <button className="w-full py-2.5 text-sm font-semibold rounded-xl gradient-bg-primary text-white">
                  {t("startFree")} →
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
