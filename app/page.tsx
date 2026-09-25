import { cookies } from "next/headers"
import { REFRESH_COOKIE } from "@/lib/auth/cookie-names"
import { LandingPage } from "@/components/landing/landing-page"
import { SessionProvider } from "@/components/utils/session/session-provider"

/**
 * Resolves the session on the server — the same presence check the `(main)`
 * layout makes — so the landing chrome can offer "Dashboard" to signed-in
 * visitors without a flash of the anonymous buttons.
 */
export default async function Home() {
  const hasSession = Boolean((await cookies()).get(REFRESH_COOKIE)?.value)

  return (
    <SessionProvider hasSession={hasSession}>
      <LandingPage />
    </SessionProvider>
  )
}
