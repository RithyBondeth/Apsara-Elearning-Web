"use client"

import { cn } from "@/lib/utils"
import { AVATAR_STYLE, toAvatarPreset } from "@/utils/constants/avatar.constant"

const TILE: Record<string, string> = {
  sm: "size-9 rounded-xl",
  md: "size-10 rounded-xl",
  lg: "size-16 rounded-2xl",
}

const GLYPH: Record<string, string> = {
  sm: "size-4.5",
  md: "size-5",
  lg: "size-8",
}

interface AvatarProps {
  /** A preset key. Unknown or missing values fall back to the default avatar. */
  preset: string | null | undefined
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * Renders a student's chosen avatar as a gradient tile.
 *
 * @example
 * <Avatar preset={profile.avatar} size="lg" />
 */
export function Avatar({ preset, size = "md", className }: AvatarProps) {
  const { icon: Icon, gradient } = AVATAR_STYLE[toAvatarPreset(preset)]

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 bg-gradient-to-br text-white",
        gradient,
        TILE[size],
        className
      )}
    >
      <Icon className={GLYPH[size]} />
    </div>
  )
}
