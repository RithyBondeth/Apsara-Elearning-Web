"use client"

import { useEffect, useState } from "react"
import { getContinueLearning } from "@/lib/api/enrollment"
import type { IApiContinueLearning } from "@/utils/interfaces/continue-learning/api.interface"

/**
 * Courses to pick back up, most recently worked on first.
 *
 * Returns `null` while loading. A guest or a failed request resolves to an
 * empty list so the caller shows its "nothing yet" state rather than spinning.
 */
export function useContinueLearning(limit?: number): IApiContinueLearning[] | null {
  const [items, setItems] = useState<IApiContinueLearning[] | null>(null)

  useEffect(() => {
    let cancelled = false
    getContinueLearning(limit)
      .then((data) => {
        if (!cancelled) setItems(data)
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  return items
}
