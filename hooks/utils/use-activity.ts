"use client"

import { useEffect, useState } from "react"
import { getMyAttempts } from "@/lib/api/quiz"
import { getMySubmissions } from "@/lib/api/challenge"
import type { IApiQuizAttempt } from "@/utils/interfaces/quiz/api.interface"
import type { IApiChallengeSubmission } from "@/utils/interfaces/challenge/api.interface"

export interface IActivity {
  /** Null while loading. */
  attempts: IApiQuizAttempt[] | null
  submissions: IApiChallengeSubmission[] | null
  error: boolean
}

/**
 * The learner's quiz attempts and coding submissions.
 *
 * Fetched together because the page shows both, and independently caught so one
 * empty history doesn't hide the other — a learner who has never touched a
 * coding challenge should still see their quiz attempts.
 */
export function useActivity(): IActivity {
  const [attempts, setAttempts] = useState<IApiQuizAttempt[] | null>(null)
  const [submissions, setSubmissions] = useState<
    IApiChallengeSubmission[] | null
  >(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    Promise.allSettled([getMyAttempts(), getMySubmissions()]).then(
      ([attemptResult, submissionResult]) => {
        if (cancelled) return
        setAttempts(
          attemptResult.status === "fulfilled" ? attemptResult.value : []
        )
        setSubmissions(
          submissionResult.status === "fulfilled" ? submissionResult.value : []
        )
        setError(
          attemptResult.status === "rejected" &&
            submissionResult.status === "rejected"
        )
      }
    )

    return () => {
      cancelled = true
    }
  }, [])

  return { attempts, submissions, error }
}
