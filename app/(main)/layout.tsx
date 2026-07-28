import type { ReactNode } from "react"
import { EntitlementProvider } from "@/components/utils/entitlements/entitlement-provider"

export default function MainLayout({ children }: { children: ReactNode }) {
  return <EntitlementProvider>{children}</EntitlementProvider>
}
