import type { ReactNode } from "react"

import { PaperGrid } from "@/components/utils/paper-grid"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <PaperGrid />
      {children}
    </div>
  )
}
