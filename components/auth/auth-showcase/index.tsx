"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { Calculator, FlaskConical, BookOpen, Languages } from "lucide-react"
import { cn } from "@/lib/utils"

const ORBITERS = [
  { icon: Calculator, radius: 150, duration: 22, delay: 0 },
  { icon: FlaskConical, radius: 150, duration: 22, delay: -11 },
  { icon: BookOpen, radius: 210, duration: 30, delay: -8 },
  { icon: Languages, radius: 210, duration: 30, delay: -23 },
]

interface AuthShowcaseProps {
  /** Large icon at the center of the orbit system */
  icon: React.ReactNode
  title: string
  description: string
  /** Extra content below the description (tags, checklist, …) */
  children?: React.ReactNode
  /** Which side of the screen the panel sits on — controls slide direction */
  side?: "left" | "right"
  className?: string
}

/**
 * Decorative auth panel: deep gradient backdrop with aurora orbs, a
 * masked grid, orbiting tech icons around a glowing centerpiece, and a
 * GSAP entrance timeline for the copy.
 */
export function AuthShowcase({
  icon,
  title,
  description,
  children,
  side = "right",
  className,
}: AuthShowcaseProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      gsap.from("[data-showcase-item]", {
        opacity: 0,
        y: 36,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.14,
        delay: 0.3,
      })
      gsap.from("[data-showcase-orbit]", {
        opacity: 0,
        scale: 0.6,
        duration: 1.2,
        ease: "back.out(1.6)",
        delay: 0.5,
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative hidden flex-1 overflow-hidden md:flex",
        "bg-gradient-to-br from-[#10254a] via-[#1b2f6e] to-[#0d3a5c]",
        className
      )}
    >
      {/* Backdrop layers */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Re-inked white for the saturated blue panel — this is the one place
            the grid sits on a colored surface rather than the page background. */}
        <div
          className="grid-pattern absolute inset-0"
          style={{
            "--grid-line": "rgba(255,255,255,0.05)",
            "--grid-line-major": "rgba(255,255,255,0.09)",
          } as React.CSSProperties}
        />
        <div className={cn("aurora-orb size-96 -top-32 bg-blue-400/25", side === "right" ? "-right-32" : "-left-32")} />
        <div className={cn("aurora-orb size-72 -bottom-20 bg-violet-400/20", side === "right" ? "-left-20" : "-right-20")} style={{ animationDelay: "-12s" }} />
        <div className="aurora-orb size-64 top-1/3 left-1/3 bg-cyan-300/15" style={{ animationDelay: "-6s", animationDuration: "32s" }} />
      </div>

      <div className="relative flex w-full flex-col items-center justify-center gap-8 px-12 py-16 text-center text-white">
        {/* Orbit system */}
        <div data-showcase-orbit className="relative flex size-64 items-center justify-center lg:size-80">
          {/* Orbit rings */}
          <div className="absolute size-[300px] rounded-full border border-white/10 lg:size-[300px]" />
          <div className="absolute size-[420px] rounded-full border border-white/5" />
          {/* Centerpiece */}
          <div className="relative flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)]">
            <div className="absolute inset-0 rounded-3xl bg-white/10 animate-breathe" />
            {icon}
          </div>
          {/* Orbiting icons */}
          {ORBITERS.map((o, i) => (
            <div
              key={i}
              className="animate-orbit absolute flex size-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/15"
              style={{
                "--orbit-radius": `${o.radius}px`,
                "--orbit-duration": `${o.duration}s`,
                animationDelay: `${o.delay}s`,
              } as React.CSSProperties}
            >
              <o.icon className="size-4.5 text-white/85" />
            </div>
          ))}
        </div>

        <div data-showcase-item>
          <h2 className="mb-3 text-3xl font-bold">{title}</h2>
          <p className="mx-auto max-w-xs text-base leading-relaxed text-white/75">
            {description}
          </p>
        </div>

        {children && <div data-showcase-item className="w-full max-w-xs">{children}</div>}
      </div>
    </div>
  )
}
