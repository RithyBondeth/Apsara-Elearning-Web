"use client"

import { createContext, useContext } from "react"

/**
 * Whether the visitor has a session, resolved on the server and handed to the
 * client tree.
 *
 * Client components cannot answer this themselves — the session cookies are
 * httpOnly by design, so nothing in the browser bundle can read them. Reading
 * the cookie in the `(main)` layout (a Server Component) and passing the
 * boolean down avoids both a JS-readable "logged in" cookie and the flash of
 * anonymous chrome that a `useEffect` probe would cause.
 *
 * This is presentation state only. It decides which chrome to render and which
 * authenticated fetches to skip — never whether data may be read. Routing is
 * gated by `middleware.ts` and authorization by the gateway's JwtAuthGuard.
 */
const SessionContext = createContext(false)

export function SessionProvider({
  hasSession,
  children,
}: {
  hasSession: boolean
  children: React.ReactNode
}) {
  return (
    <SessionContext.Provider value={hasSession}>
      {children}
    </SessionContext.Provider>
  )
}

export function useHasSession(): boolean {
  return useContext(SessionContext)
}
