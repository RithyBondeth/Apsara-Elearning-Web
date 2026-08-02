import { createJSONStorage, type StateStorage } from "zustand/middleware"

/** No-op storage used on the server, where localStorage doesn't exist. */
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

/**
 * SSR-safe persist storage: real localStorage in the browser, a no-op on the
 * server so a persisted store never throws during server rendering.
 */
export const safePersistStorage = createJSONStorage(() =>
  typeof window === "undefined" ? noopStorage : localStorage
)
