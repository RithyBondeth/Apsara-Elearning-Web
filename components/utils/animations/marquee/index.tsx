"use client"

import { cn } from "@/lib/utils"

interface MarqueeProps {
  children: React.ReactNode
  className?: string
  /** Scroll direction (default: "left") */
  direction?: "left" | "right"
  /** Seconds per full loop (default: 40) */
  duration?: number
  /** Pause the loop while hovered (default: true) */
  pauseOnHover?: boolean
}

/**
 * Infinite horizontal marquee. Children are rendered twice and scrolled
 * -50% for a seamless loop, with fading edge masks.
 *
 * @example
 * <Marquee duration={30}>{cards}</Marquee>
 */
export function Marquee({
  children,
  className,
  direction = "left",
  duration = 40,
  pauseOnHover = true,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        "marquee-mask overflow-hidden",
        pauseOnHover && "marquee-paused",
        className
      )}
    >
      <div
        className={cn(
          "flex w-max py-4",
          direction === "left" ? "animate-marquee" : "animate-marquee-reverse"
        )}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        <div className="flex shrink-0 gap-5 pr-5">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-5 pr-5">
          {children}
        </div>
      </div>
    </div>
  )
}
