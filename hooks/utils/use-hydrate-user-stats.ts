"use client"

import { useEffect } from "react"
import { getMe } from "@/lib/api/user"
import { useProfileStore } from "@/stores/profiles/profile-store"
import { toAvatarPreset } from "@/utils/constants/avatar.constant"
import { displayNameOf } from "@/utils/functions/user"

/**
 * Module-level (not React state) so remounting AppShell on client-side
 * navigation between dashboard/courses/profile doesn't refetch every time —
 * only once per full page load.
 */
let hasFetched = false

/** Call on logout so the next login (same tab, no full reload) refetches. */
export function resetUserStatsFetchFlag() {
  hasFetched = false
}

/**
 * Pulls the student's real identity + XP/streak from `GET /user/me` once per
 * load and pushes them into the profile store. Call from a component mounted
 * on every authenticated page (AppShell).
 *
 * `weeklyGoal` is deliberately left alone — it has no API column, so the
 * store's persisted value is the source of truth for it.
 *
 * Pass `enabled: false` for anonymous visitors: `/user/me` is guarded, so the
 * call is a guaranteed 401 on the public pages the shell also renders.
 */
export function useHydrateUserStats(enabled = true) {
  const setStats = useProfileStore((s) => s.setStats)
  const updateProfile = useProfileStore((s) => s.updateProfile)

  useEffect(() => {
    if (!enabled || hasFetched) return
    hasFetched = true

    getMe()
      .then((user) => {
        setStats({ xp: user.xp, streak: user.streak })
        updateProfile({
          name: displayNameOf(user),
          /* No Khmer-name column on the API yet — clear any stale local value. */
          nameKh: "",
          email: user.email,
          avatar: toAvatarPreset(user.avatar),
        })
      })
      .catch(() => {
        /* Session likely expired mid-flight — the proxy already redirected
           via middleware on next navigation; stale stats just stay put. */
        hasFetched = false
      })
  }, [enabled, setStats, updateProfile])
}
