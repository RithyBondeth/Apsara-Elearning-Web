"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"

interface GrowBarProps {
  /** Fill percentage the bar grows to, 0–100 */
  to: number
  /** "x" fills a horizontal bar by width; "y" grows a column by height */
  axis?: "x" | "y"
  /** Total animation duration in seconds (default: 1.1) */
  duration?: number
  /** GSAP ease string (default: "power3.out") */
  ease?: string
  /** Delay in seconds after entering the viewport (default: 0) */
  delay?: number
  /** Fraction of element that must be visible to trigger (default: 0.1) */
  threshold?: number
  /** Extra className on the bar itself — carries the fill colour and radius */
  className?: string
  /** Native tooltip text */
  title?: string
}

/**
 * Grows a progress bar from empty to `to`% when it scrolls into view, powered
 * by GSAP. Pair with `<CountUp>` so a figure and its bar animate in sympathy.
 *
 * Renders empty on the server and fills once observed, so the growth is always
 * visible on first paint — a bar rendered at its final width would have nothing
 * to animate.
 *
 * Expects a wrapping track element with a definite size — a percentage cannot
 * resolve against a track whose own size is auto (e.g. one sized by flex-grow).
 *
 * @example
 * <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
 *   <GrowBar to={72} className="h-full rounded-full gradient-bg-primary" delay={0.3} />
 * </div>
 */
export function GrowBar({
  to,
  axis = "x",
  duration = 1.1,
  ease = "power3.out",
  delay = 0,
  threshold = 0.1,
  className,
  title,
}: GrowBarProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const dimension = axis === "x" ? "width" : "height"
    const target = `${to}%`

    // Respect reduced-motion: jump straight to the final size
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { [dimension]: target })
      return
    }

    let tween: gsap.core.Tween | undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tween = gsap.to(el, { [dimension]: target, duration, ease, delay })
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    )

    observer.observe(el)

    return () => {
      tween?.kill()
      observer.disconnect()
    }
  }, [to, axis, duration, ease, delay, threshold])

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{ [axis === "x" ? "width" : "height"]: 0 }}
      title={title}
    />
  )
}
