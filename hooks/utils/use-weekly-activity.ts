"use client"

import { useEffect, useState } from "react"
import { getMyLessonProgress } from "@/lib/api/lesson-progress"

/** Mon→Sun; keys match the `dashboard.days.*` translation keys. */
const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const

export interface IWeekDayActivity {
  key: (typeof DAY_KEYS)[number]
  lessons: number
  isToday: boolean
}

export interface IWeeklyActivity {
  days: IWeekDayActivity[]
  /** Total lessons completed this week (Mon→Sun). */
  done: number
}

/** Local midnight of the Monday that starts the week containing `d`. */
function mondayOf(d: Date): Date {
  const monday = new Date(d)
  monday.setHours(0, 0, 0, 0)
  /* getDay(): 0=Sun … 6=Sat. Days back to Monday, treating Sunday as day 7. */
  monday.setDate(monday.getDate() - ((d.getDay() + 6) % 7))
  return monday
}

/**
 * The current week's lesson-completion strip, derived from the `completedAt`
 * timestamps on `GET /lesson-progress` — there's no dedicated activity endpoint,
 * so this is the real source of daily counts. Returns `null` while loading;
 * guests/empty accounts get a zeroed week.
 */
export function useWeeklyActivity(): IWeeklyActivity | null {
  const [activity, setActivity] = useState<IWeeklyActivity | null>(null)

  useEffect(() => {
    let cancelled = false

    const now = new Date()
    const monday = mondayOf(now)
    const todayIdx = (now.getDay() + 6) % 7

    const buildWeek = (counts: number[]): IWeeklyActivity => ({
      days: DAY_KEYS.map((key, i) => ({
        key,
        lessons: counts[i],
        isToday: i === todayIdx,
      })),
      done: counts.reduce((sum, n) => sum + n, 0),
    })

    getMyLessonProgress()
      .then((progress) => {
        if (cancelled) return
        const counts = Array(7).fill(0)
        for (const p of progress) {
          if (!p.completed || !p.completedAt) continue
          const at = new Date(p.completedAt)
          const dayIdx = Math.floor((at.getTime() - monday.getTime()) / 86_400_000)
          if (dayIdx >= 0 && dayIdx < 7) counts[dayIdx] += 1
        }
        setActivity(buildWeek(counts))
      })
      .catch(() => {
        /* Guest or expired session — show a zeroed week rather than nothing. */
        if (!cancelled) setActivity(buildWeek(Array(7).fill(0)))
      })

    return () => {
      cancelled = true
    }
  }, [])

  return activity
}
