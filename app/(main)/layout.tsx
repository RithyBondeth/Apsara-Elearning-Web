import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { REFRESH_COOKIE } from "@/lib/auth/cookie-names"
import { EntitlementProvider } from "@/components/utils/entitlements/entitlement-provider"
import { SessionProvider } from "@/components/utils/session/session-provider"

/**
 * `(main)` mixes protected pages with genuinely public ones (`/courses`,
 * `/pricing`), so the shell has to render for anonymous visitors too. The
 * session is resolved here — the same presence check `middleware.ts` makes —
 * so the client tree can skip authenticated fetches instead of firing them and
 * swallowing the 401s.
 */
export default async function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const hasSession = Boolean((await cookies()).get(REFRESH_COOKIE)?.value)

  return (
    <SessionProvider hasSession={hasSession}>
      <EntitlementProvider>{children}</EntitlementProvider>
    </SessionProvider>
  )
}
