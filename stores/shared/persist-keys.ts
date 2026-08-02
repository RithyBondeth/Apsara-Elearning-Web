/**
 * localStorage keys for every persisted zustand store, in one place so they
 * can't drift or collide. Values are unchanged from when they were inline, so
 * existing persisted state keeps loading.
 */
export const STORE_PERSIST_KEYS = {
  language: "apsara-elearning-language",
  profile: "apsara-elearning-profile",
} as const
