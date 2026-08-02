"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { cn } from "@/lib/utils"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  /** Maximum tilt angle in degrees (default: 8) */
  maxTilt?: number
  /** Render a moving glare highlight over the card (default: true) */
  glare?: boolean
}

/**
 * 3-D perspective tilt that tracks the cursor, with an optional glare
 * sweep. Springs back flat when the cursor leaves.
 *
 * @example
 * <TiltCard maxTilt={6}><AppMockup /></TiltCard>
 */
export function TiltCard({ children, className, maxTilt = 8, glare = true }: TiltCardProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const wrap = wrapRef.current
    const card = cardRef.current
    if (!wrap || !card) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (window.matchMedia("(hover: none)").matches) return

    const rxTo = gsap.quickTo(card, "rotationX", { duration: 0.38, ease: "power3.out" })
    const ryTo = gsap.quickTo(card, "rotationY", { duration: 0.38, ease: "power3.out" })

    const onMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width // 0 → 1
      const py = (e.clientY - rect.top) / rect.height
      ryTo((px - 0.5) * 2 * maxTilt)
      rxTo(-(py - 0.5) * 2 * maxTilt)
      if (glareRef.current) {
        gsap.to(glareRef.current, {
          opacity: 0.5,
          x: `${(px - 0.5) * 120}%`,
          y: `${(py - 0.5) * 120}%`,
          duration: 0.3,
          ease: "power3.out",
        })
      }
    }
    const onLeave = () => {
      rxTo(0)
      ryTo(0)
      if (glareRef.current) {
        gsap.to(glareRef.current, { opacity: 0, duration: 0.38, ease: "power3.out" })
      }
    }

    wrap.addEventListener("mousemove", onMove)
    wrap.addEventListener("mouseleave", onLeave)
    return () => {
      wrap.removeEventListener("mousemove", onMove)
      wrap.removeEventListener("mouseleave", onLeave)
    }
  }, [maxTilt])

  return (
    <div ref={wrapRef} className={cn("perspective-1200", className)}>
      <div ref={cardRef} className="preserve-3d relative will-change-transform">
        {children}
        {glare && (
          <div
            ref={glareRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0"
            style={{
              background:
                "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.22), transparent 70%)",
            }}
          />
        )}
      </div>
    </div>
  )
}
