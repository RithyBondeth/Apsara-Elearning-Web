import { beforeEach, describe, expect, it } from "vitest"

import { useEntitlementStore } from "@/stores/entitlements/entitlement-store"
import type { IApiResolvedEntitlement } from "@/utils/interfaces/subscription/api.interface"

function resolved(
  entitlement: string,
  granted: boolean
): IApiResolvedEntitlement {
  return { entitlement, granted } as IApiResolvedEntitlement
}

describe("useEntitlementStore", () => {
  beforeEach(() => {
    useEntitlementStore.getState().clear()
  })

  it("starts empty and unhydrated", () => {
    const state = useEntitlementStore.getState()
    expect(state.entitlements).toEqual({})
    expect(state.hydrated).toBe(false)
    expect(state.loading).toBe(false)
  })

  it("indexes entitlements by key and marks itself hydrated", () => {
    useEntitlementStore.getState().setEntitlements([
      resolved("ai:tutor", true),
      resolved("courses:premium", false),
    ])

    const state = useEntitlementStore.getState()
    expect(state.hydrated).toBe(true)
    expect(state.loading).toBe(false)
    expect(state.entitlements["ai:tutor"]?.granted).toBe(true)
  })

  it("has() is true only when a grant is explicitly granted", () => {
    useEntitlementStore.getState().setEntitlements([
      resolved("ai:tutor", true),
      resolved("courses:premium", false),
    ])

    const { has } = useEntitlementStore.getState()
    expect(has("ai:tutor")).toBe(true)
    expect(has("courses:premium")).toBe(false)
    // Unknown keys are treated as not granted.
    expect(has("certificates")).toBe(false)
  })

  it("clear() resets to the initial state", () => {
    const store = useEntitlementStore.getState()
    store.setEntitlements([resolved("ai:tutor", true)])
    store.clear()

    const state = useEntitlementStore.getState()
    expect(state.entitlements).toEqual({})
    expect(state.hydrated).toBe(false)
    expect(state.has("ai:tutor")).toBe(false)
  })

  it("setLoading toggles the loading flag", () => {
    useEntitlementStore.getState().setLoading(true)
    expect(useEntitlementStore.getState().loading).toBe(true)
  })
})
