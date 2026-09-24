"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

const SIZES = { sm: "size-3.5", md: "size-4", lg: "size-5" } as const

/**
 * Five stars, either read-only or pickable.
 *
 * Read-only mode fills a star when the value reaches it, so a 4.6 average shows
 * five filled stars only at 5 — it rounds to nearest rather than flooring, which
 * would make 4.9 look like 4.
 *
 * Prop-driven and free of translated copy, so it renders from data alone.
 */
export function StarRating({
  value,
  onChange,
  size = "md",
  className,
}: {
  value: number
  onChange?: (value: number) => void
  size?: keyof typeof SIZES
  className?: string
}) {
  const interactive = typeof onChange === "function"
  const filledTo = Math.round(value)

  return (
    <div
      data-testid="star-rating"
      data-value={value}
      role={interactive ? "radiogroup" : "img"}
      aria-label={interactive ? undefined : `${value} out of 5`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= filledTo
        const icon = (
          <Star
            className={cn(
              SIZES[size],
              filled
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            )}
          />
        )

        return interactive ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === filledTo}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange?.(star)}
            className="rounded transition-transform motion-safe:hover:scale-110"
          >
            {icon}
          </button>
        ) : (
          <span key={star}>{icon}</span>
        )
      })}
    </div>
  )
}
