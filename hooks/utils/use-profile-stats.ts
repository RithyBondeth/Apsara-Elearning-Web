"use client"

import { useProfileStore } from "@/stores/profiles/profile-store"
import type { IProfileStats } from "@/stores/profiles/profile-store"
import { useHydrated } from "@/hooks/utils/use-hydrated"

/**
 * Reads the student's earned stats (XP, streak) — separate from `useProfile`
 * because these are never part of the edit form, only ever set by `setStats`
 * after a `GET /user/me` fetch.
 *
 * @example
 * const { xp, streak } = useProfileStats()
 */
export function useProfileStats(): IProfileStats {
  const hydrated = useHydrated()

  const xp     = useProfileStore((s) => s.xp)
  const streak = useProfileStore((s) => s.streak)

  if (!hydrated) return { xp: 0, streak: 0 }
  return { xp, streak }
}
