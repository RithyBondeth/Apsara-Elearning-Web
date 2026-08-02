"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import gsap from "gsap"

interface CountUpProps {
  /** Target number to count up to */
  to: number
  /** Starting number (default: 0) */
  from?: number
  /** Total animation duration in seconds (default: 2) */
  duration?: number
  /** GSAP ease string (default: "power2.out") */
  ease?: string
  /** Text prepended to the number, e.g. "#" */
  prefix?: string
  /** Text appended to the number, e.g. "+", "%", "d" */
  suffix?: string
  /** Decimal places shown during counting (default: 0) */
  decimals?: number
  /** Format with locale thousands separator, e.g. 12000 → "12,000" */
  locale?: boolean
  /** Delay in seconds after entering the viewport (default: 0) */
  delay?: number
  /** Fraction of element that must be visible to trigger (default: 0.1) */
  threshold?: number
  /** Extra className on the wrapping span */
  className?: string
}

/**
 * Counts a number from `from` to `to` when it scrolls into view,
 * powered by GSAP. Supports prefix/suffix, locale formatting,
 * and decimal places.
 *
 * @example
 * <CountUp to={12000} suffix="+" locale delay={0.3} />
 */
export function CountUp({
  to,
  from = 0,
  duration = 2,
  ease = "power2.out",
  prefix = "",
  suffix = "",
  decimals = 0,
  locale = false,
  delay = 0,
  threshold = 0.1,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(from)
  const spanRef = useRef<HTMLSpanElement>(null)
  const counter = useRef({ value: from })

  const format = (n: number): string => {
    const v = decimals === 0 ? Math.round(n) : Number(n.toFixed(decimals))
    if (locale) return v.toLocaleString()
    return decimals === 0 ? String(v) : v.toFixed(decimals)
  }

  useEffect(() => {
    const el = spanRef.current
    if (!el) return

    // Respect reduced-motion: jump straight to final value
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // This synchronizes rendered output with an external accessibility setting.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(to)
      return
    }

    let tween: gsap.core.Tween | undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Reset and animate
          counter.current.value = from
          tween = gsap.to(counter.current, {
            value: to,
            duration,
            ease,
            delay,
            onUpdate: () => setDisplay(counter.current.value),
            onComplete: () => setDisplay(to), // guarantee exact final value
          })
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
  }, [to, from, duration, ease, delay, threshold])

  return (
    <span ref={spanRef} className={cn(className)}>
      {prefix}{format(display)}{suffix}
    </span>
  )
}
