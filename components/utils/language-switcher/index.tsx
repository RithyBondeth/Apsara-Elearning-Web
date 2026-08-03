"use client"

import { Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguageStore } from "@/stores/languages/language-store"

interface LanguageSwitcherProps {
  className?: string
  size?: "sm" | "default"
}

export function LanguageSwitcher({
  className,
  size = "default",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguageStore()
  const label = language === "en" ? "Switch to Khmer" : "Switch to English"

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "en" ? "km" : "en")}
      aria-label={label}
      title={label}
      className={cn(
        "group relative flex items-center justify-center rounded-xl",
        "border border-border bg-background",
        "text-muted-foreground hover:text-foreground",
        "hover:border-border/80 hover:bg-muted",
        "transition-all duration-200",
        size === "sm" ? "size-8" : "size-9",
        className
      )}
    >
      <Languages
        className={cn(
          "transition-transform duration-200 group-hover:scale-105",
          size === "sm" ? "size-3.5" : "size-4"
        )}
      />
    </button>
  )
}
