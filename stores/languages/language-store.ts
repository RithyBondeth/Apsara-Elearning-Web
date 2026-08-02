"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TLanguage } from "@/utils/types/app"
import { STORE_PERSIST_KEYS } from "@/stores/shared/persist-keys"
import { safePersistStorage } from "@/stores/shared/persist-storage"

interface ILanguageState {
  language: TLanguage
  setLanguage: (language: TLanguage) => void
}

export const useLanguageStore = create<ILanguageState>()(
  persist(
    (set) => ({
      language: "en",
      setLanguage: (language) => {
        document.cookie = `apsara-elearning-lang=${language};path=/;max-age=31536000;SameSite=Lax`
        set({ language })
      },
    }),
    { name: STORE_PERSIST_KEYS.language, storage: safePersistStorage }
  )
)
