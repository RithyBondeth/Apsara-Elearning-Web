"use client"

import { create } from "zustand"
import type {
  IApiResolvedEntitlement,
  TEntitlementKey,
} from "@/utils/interfaces/subscription/api.interface"

interface IEntitlementState {
  entitlements: Partial<Record<TEntitlementKey, IApiResolvedEntitlement>>
  loading: boolean
  hydrated: boolean
  setLoading: (loading: boolean) => void
  setEntitlements: (values: IApiResolvedEntitlement[]) => void
  clear: () => void
  has: (key: TEntitlementKey) => boolean
}

export const useEntitlementStore = create<IEntitlementState>((set, get) => ({
  entitlements: {},
  loading: false,
  hydrated: false,
  setLoading: (loading) => set({ loading }),
  setEntitlements: (values) =>
    set({
      entitlements: Object.fromEntries(
        values.map((value) => [value.entitlement, value])
      ),
      loading: false,
      hydrated: true,
    }),
  clear: () => set({ entitlements: {}, loading: false, hydrated: false }),
  has: (key) => get().entitlements[key]?.granted === true,
}))
