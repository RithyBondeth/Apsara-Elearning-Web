"use client"

import { useEffect, useState } from "react"
import { getAllBadges, getMyBadges } from "@/lib/api/badges"
import type { IApiBadge } from "@/utils/interfaces/badge/api.interface"

export interface IBadgeItem {
  badge: IApiBadge
  earned: boolean
  earnedAt?: string
}

/**
 * The full badge catalog with the student's earned state merged in.
 * Returns `null` while loading; guests just see every badge locked.
 */
export function useBadges(): IBadgeItem[] | null {
  const [items, setItems] = useState<IBadgeItem[] | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getAllBadges(), getMyBadges().catch(() => [])])
      .then(([all, mine]) => {
        if (cancelled) return
        const earnedById = new Map(mine.map((b) => [b.badgeId, b.earnedAt]))
        setItems(
          all.map((badge) => ({
            badge,
            earned: earnedById.has(badge.id),
            earnedAt: earnedById.get(badge.id),
          }))
        )
      })
      .catch(() => {
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return items
}
