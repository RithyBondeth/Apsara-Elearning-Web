import type { ReactNode } from "react"
import { LanguageSwitcher } from "@/components/utils/language-switcher"
import { ThemeToggle } from "@/components/utils/themes/theme-toggle"
import { AuroraBackground } from "@/components/utils/animations/aurora-background"
import { PaperGrid } from "@/components/utils/paper-grid"
import { AuthFloatingGlyphs } from "@/components/auth/auth-floating-glyphs"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page landing-page relative h-svh overflow-hidden bg-background">
      <PaperGrid />
      <AuroraBackground grid={false} />
      <div
        aria-hidden
        className="hero-reading-halo pointer-events-none absolute inset-0 z-[1]"
      />
      <AuthFloatingGlyphs />
      <div className="fixed right-4 top-4 z-20 flex items-center gap-2 sm:right-6 sm:top-6">
        <LanguageSwitcher className="auth-floating-control" />
        <ThemeToggle className="auth-floating-control" />
      </div>
      <div className="relative z-10 h-svh">{children}</div>
    </div>
  )
}
