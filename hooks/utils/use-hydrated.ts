"use client"

import { useSyncExternalStore } from "react"

/** Nothing to subscribe to — hydration happens exactly once. */
const subscribe = () => () => {}

/**
 * False on the server and during the first client render, true afterwards.
 *
 * Lets a component render server-safe defaults on the pass that must match the
 * server HTML, then swap in client-only state (a persisted store, the resolved
 * theme) once hydration is done — without a setState-in-effect round trip.
 *
 * @example
 * const hydrated = useHydrated()
 * return <span>{hydrated ? stored.name : DEFAULTS.name}</span>
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false)
}
