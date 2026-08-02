"use client"

import { create } from "zustand"
import {
  getActiveSubscription,
  getSubscriptionPlans,
} from "@/lib/api/subscription"
import type {
  IApiActiveSubscription,
  IApiPlan,
} from "@/utils/interfaces/subscription/api.interface"

interface ISubscriptionState {
  plans: IApiPlan[]
  active: IApiActiveSubscription | null
  loading: boolean
  loaded: boolean
  error: boolean
  /** Whether the loaded snapshot includes the signed-in user's subscription. */
  loadedAuthed: boolean | null
  /** `authed` is explicit rather than defaulted: getting it wrong either fires
   *  a guaranteed 401 or silently hides an existing subscription. */
  hydrate: (options: { authed: boolean; force?: boolean }) => Promise<void>
  clear: () => void
}

let request: Promise<void> | null = null

export const useSubscriptionStore = create<ISubscriptionState>((set, get) => ({
  plans: [],
  active: null,
  loading: false,
  loaded: false,
  loadedAuthed: null,
  error: false,
  hydrate: async ({ authed, force = false }) => {
    /* Signing in is a client-side navigation, so this module-level store
       survives it. Re-hydrating when `authed` changes is what stops a session
       started from a public page from keeping the anonymous snapshot — which
       would report an existing subscriber as having none. */
    if (!force && get().loaded && get().loadedAuthed === authed) return
    if (request) return request

    set({ loading: true, error: false })
    request = Promise.all([
      /* Plans are public — the pricing page renders them signed out. The
         active subscription is not, so anonymous visitors skip that call. */
      getSubscriptionPlans(),
      authed ? getActiveSubscription().catch(() => null) : null,
    ])
      .then(([plans, active]) =>
        set({
          plans,
          active,
          loading: false,
          loaded: true,
          loadedAuthed: authed,
          error: false,
        })
      )
      .catch(() =>
        set({ loading: false, loaded: true, loadedAuthed: authed, error: true })
      )
      .finally(() => {
        request = null
      })
    return request
  },
  clear: () => {
    request = null
    set({
      plans: [],
      active: null,
      loading: false,
      loaded: false,
      loadedAuthed: null,
      error: false,
    })
  },
}))
