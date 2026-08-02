import type { ReactNode } from "react"
import { AnimatedShaderBackground } from "@/components/ui/animated-shader-background"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page relative min-h-svh overflow-x-hidden bg-[#f3f7ff] dark:bg-[#020817]">
      <AnimatedShaderBackground />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.02)_0%,rgba(219,234,254,0.08)_58%,rgba(191,219,254,0.28)_100%)] dark:bg-[radial-gradient(circle_at_50%_30%,transparent_0%,rgba(2,8,23,0.12)_48%,rgba(2,8,23,0.76)_100%)]"
      />
      <div className="relative z-10 min-h-svh">{children}</div>
    </div>
  )
}
