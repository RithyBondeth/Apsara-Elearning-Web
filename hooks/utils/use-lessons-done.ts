"use client"

import { useEffect, useState } from "react"
import { getMyLessonProgress } from "@/lib/api/lesson-progress"

/* Module-level cache so the count survives client-side navigation between
   authenticated pages — the AppShell mounts on every one, but this only
   fetches once per full page load (mirrors use-hydrate-user-stats). */
let cached: number | null = null
let inFlight: Promise<number> | null = null

/** Call on logout so the next session refetches. */
export function resetLessonsDoneCache() {
  cached = null
  inFlight = null
}

/**
 * Total lessons the student has completed, across all courses — the count of
 * completed `GET /lesson-progress` records. Returns `null` until resolved.
 *
 * Pass `enabled: false` for anonymous visitors: `/lesson-progress` is guarded,
 * so there is no progress to count and the call would only 401.
 */
export function useLessonsDone(enabled = true): number | null {
  const [count, setCount] = useState<number | null>(cached)

  useEffect(() => {
    if (!enabled || cached !== null) return
    inFlight ??= getMyLessonProgress()
      .then((progress) => {
        cached = progress.filter((p) => p.completed).length
        return cached
      })
      .catch(() => {
        inFlight = null
        return 0
      })
    inFlight.then((n) => setCount(n))
  }, [enabled])

  return count
}
