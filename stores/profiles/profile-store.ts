"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { DEFAULT_AVATAR } from "@/utils/constants/avatar.constant"
import type { TAvatarPreset } from "@/utils/constants/avatar.constant"
import { STORE_PERSIST_KEYS } from "@/stores/shared/persist-keys"
import { safePersistStorage } from "@/stores/shared/persist-storage"

/** The fields a student can edit. Level, XP and streak are earned, not set. */
export interface IProfileFields {
  name: string
  nameKh: string
  email: string
  /** Key of the built-in avatar the student picked */
  avatar: TAvatarPreset
  /** Lessons the student aims to finish each week — drives the dashboard goal bar */
  weeklyGoal: number
}

/** Earned stats — read from `GET /user/me`, never set through the edit form. */
export interface IProfileStats {
  xp: number
  streak: number
}

interface IProfileState extends IProfileFields, IProfileStats {
  updateProfile: (patch: Partial<IProfileFields>) => void
  resetProfile: () => void
  setStats: (stats: IProfileStats) => void
}

/**
 * Empty until `GET /user/me` hydrates the real identity (see
 * `use-hydrate-user-stats`). `weeklyGoal` is client-only — the API has no
 * column for it — so its edits live purely in this persisted store.
 */
const DEFAULTS: IProfileFields = {
  name: "",
  nameKh: "",
  email: "",
  avatar: DEFAULT_AVATAR,
  weeklyGoal: 8,
}

/** Placeholder shown until the first `setStats` call resolves. */
const STATS_DEFAULTS: IProfileStats = {
  xp: 0,
  streak: 0,
}

export const PROFILE_DEFAULTS = DEFAULTS

export const useProfileStore = create<IProfileState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      ...STATS_DEFAULTS,
      updateProfile: (patch) => set(patch),
      resetProfile: () => set(DEFAULTS),
      setStats: (stats) => set(stats),
    }),
    { name: STORE_PERSIST_KEYS.profile, storage: safePersistStorage }
  )
)
