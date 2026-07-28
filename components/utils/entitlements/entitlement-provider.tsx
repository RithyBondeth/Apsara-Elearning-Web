"use client"

import { useEffect } from "react"
import { getEntitlements } from "@/lib/api/subscription"
import { useEntitlementStore } from "@/stores/entitlements/entitlement-store"
import { useSubscriptionStore } from "@/stores/subscriptions/subscription-store"

export function EntitlementProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    let active = true
    const state = useEntitlementStore.getState()
    state.setLoading(true)
    void useSubscriptionStore.getState().hydrate()
    getEntitlements()
      .then((values) => active && state.setEntitlements(values))
      .catch(() => active && state.clear())
    return () => {
      active = false
    }
  }, [])

  return children
}
