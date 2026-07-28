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
  hydrate: (force?: boolean) => Promise<void>
  clear: () => void
}

let request: Promise<void> | null = null

export const useSubscriptionStore = create<ISubscriptionState>((set, get) => ({
  plans: [],
  active: null,
  loading: false,
  loaded: false,
  error: false,
  hydrate: async (force = false) => {
    if (!force && get().loaded) return
    if (request) return request

    set({ loading: true, error: false })
    request = Promise.all([
      getSubscriptionPlans(),
      getActiveSubscription().catch(() => null),
    ])
      .then(([plans, active]) =>
        set({ plans, active, loading: false, loaded: true, error: false })
      )
      .catch(() => set({ loading: false, loaded: true, error: true }))
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
      error: false,
    })
  },
}))
