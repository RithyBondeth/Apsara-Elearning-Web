"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useHydrated } from "@/hooks/utils/use-hydrated"

interface ThemeToggleProps {
  className?: string
  size?: "sm" | "default"
}

export function ThemeToggle({ className, size = "default" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useHydrated()

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-xl border border-border bg-muted/50",
          size === "sm" ? "size-8" : "size-9",
          className
        )}
      />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "group relative flex items-center justify-center rounded-xl",
        "border border-border bg-background",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-muted hover:border-border/80",
        "transition-all duration-200",
        size === "sm" ? "size-8" : "size-9",
        className
      )}
    >
      {/* Sun icon (visible in dark mode — click to go light) */}
      <Sun
        className={cn(
          "absolute transition-all duration-300 ease-in-out",
          size === "sm" ? "size-3.5" : "size-4",
          isDark
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-[-90deg] scale-75"
        )}
      />
      {/* Moon icon (visible in light mode — click to go dark) */}
      <Moon
        className={cn(
          "absolute transition-all duration-300 ease-in-out",
          size === "sm" ? "size-3.5" : "size-4",
          isDark
            ? "opacity-0 rotate-90 scale-75"
            : "opacity-100 rotate-0 scale-100"
        )}
      />
    </button>
  )
}
