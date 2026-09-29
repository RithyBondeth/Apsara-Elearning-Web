"use client"

import { useRouter } from "next/navigation"
import { logoutRequest } from "@/lib/auth/client"
import { useProfileStore } from "@/stores/profiles/profile-store"
import { resetUserStatsFetchFlag } from "@/hooks/utils/use-hydrate-user-stats"
import { resetLessonsDoneCache } from "@/hooks/utils/use-lessons-done"
import { useEntitlementStore } from "@/stores/entitlements/entitlement-store"
import { useSubscriptionStore } from "@/stores/subscriptions/subscription-store"

/**
 * Clears the session cookies (via the BFF), the persisted profile store, and
 * the stats-fetch guard, then sends the student back to /login. Shared by
 * every sign-out entry point (AppShell, profile page, account deletion) so
 * the sequence can't drift between them.
 *
 * `redirectTo` defaults to /login. It's checked to be a string because the
 * hook is also passed straight to onClick handlers, which hand it an event.
 */
export function useSignOut() {
  const router = useRouter()
  const resetProfile = useProfileStore((s) => s.resetProfile)

  return async (redirectTo?: unknown) => {
    await logoutRequest()
    resetUserStatsFetchFlag()
    resetLessonsDoneCache()
    useEntitlementStore.getState().clear()
    useSubscriptionStore.getState().clear()
    resetProfile()
    router.push(typeof redirectTo === "string" ? redirectTo : "/login")
  }
}
