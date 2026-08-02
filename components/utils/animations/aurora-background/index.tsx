"use client"

import { cn } from "@/lib/utils"

interface AuroraBackgroundProps {
  /** Extra classes on the wrapper (positioning, z-index, …) */
  className?: string
  /** Show the masked grid pattern behind the orbs (default: true) */
  grid?: boolean
}

/**
 * Full-bleed decorative background: three slowly drifting aurora orbs
 * over an optional masked grid. Purely CSS-animated, pointer-events none.
 *
 * @example
 * <section className="relative">
 *   <AuroraBackground />
 *   ...content...
 * </section>
 */
export function AuroraBackground({ className, grid = true }: AuroraBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {grid && <div className="grid-pattern grid-mask-radial absolute inset-0" />}
      <div className="aurora-orb aurora-blue size-[480px] -top-40 left-[8%]" />
      <div
        className="aurora-orb aurora-violet size-[420px] top-[18%] right-[4%]"
        style={{ animationDelay: "-8s", animationDuration: "30s" }}
      />
      <div
        className="aurora-orb aurora-cyan size-[380px] bottom-[-10%] left-[30%]"
        style={{ animationDelay: "-16s", animationDuration: "26s" }}
      />
      <div
        className="aurora-orb aurora-amber size-[340px] bottom-[6%] right-[16%]"
        style={{ animationDelay: "-4s", animationDuration: "34s" }}
      />
    </div>
  )
}
