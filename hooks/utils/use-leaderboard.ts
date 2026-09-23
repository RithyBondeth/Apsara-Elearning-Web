"use client"

import { useEffect, useState } from "react"
import { getLeaderboard } from "@/lib/api/leaderboard"
import type { IApiLeaderboard } from "@/utils/interfaces/leaderboard/api.interface"

/**
 * The XP board plus the learner's own standing.
 *
 * `board` stays null while loading; `error` is set when the fetch fails so the
 * page can say so rather than showing a permanently empty board.
 */
export function useLeaderboard(limit?: number) {
  const [board, setBoard] = useState<IApiLeaderboard | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    getLeaderboard(limit)
      .then((data) => {
        if (!cancelled) setBoard(data)
      })
      .catch(() => {
        if (cancelled) return
        setError(true)
        setBoard({ entries: [], me: null, total: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  return { board, error }
}
