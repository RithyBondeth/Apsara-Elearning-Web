"use client"

import { useEffect } from "react"
import { getEntitlements } from "@/lib/api/subscription"
import { useHasSession } from "@/components/utils/session/session-provider"
import { useEntitlementStore } from "@/stores/entitlements/entitlement-store"
import { useSubscriptionStore } from "@/stores/subscriptions/subscription-store"

export function EntitlementProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const hasSession = useHasSession()

  useEffect(() => {
    const state = useEntitlementStore.getState()

    /* Entitlements are per-user and the endpoint is guarded — an anonymous
       visitor on /courses or /pricing has none, and asking would only 401. */
    if (!hasSession) {
      state.clear()
      void useSubscriptionStore.getState().hydrate({ authed: false })
      return
    }

    let active = true
    state.setLoading(true)
    void useSubscriptionStore.getState().hydrate({ authed: true })
    getEntitlements()
      .then((values) => active && state.setEntitlements(values))
      .catch(() => active && state.clear())
    return () => {
      active = false
    }
  }, [hasSession])

  return children
}
