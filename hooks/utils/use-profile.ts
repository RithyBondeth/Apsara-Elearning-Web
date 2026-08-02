"use client"

import { useProfileStore, PROFILE_DEFAULTS } from "@/stores/profiles/profile-store"
import type { IProfileFields } from "@/stores/profiles/profile-store"
import { useHydrated } from "@/hooks/utils/use-hydrated"

/**
 * Reads the persisted profile without breaking hydration. The server and the
 * first client render both see the seeded defaults; stored edits swap in once
 * mounted, so the two renders always agree.
 *
 * @example
 * const { name, weeklyGoal } = useProfile()
 */
export function useProfile(): IProfileFields {
  const hydrated = useHydrated()

  const name       = useProfileStore((s) => s.name)
  const nameKh     = useProfileStore((s) => s.nameKh)
  const email      = useProfileStore((s) => s.email)
  const avatar     = useProfileStore((s) => s.avatar)
  const weeklyGoal = useProfileStore((s) => s.weeklyGoal)

  if (!hydrated) return PROFILE_DEFAULTS
  return { name, nameKh, email, avatar, weeklyGoal }
}
