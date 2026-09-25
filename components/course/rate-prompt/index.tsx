"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Star, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { StarRating } from "@/components/course/course-ratings/star-rating"
import { getMyRating, rateCourse } from "@/lib/api/rating"

/** Per-course "not now" — a per-viewer convenience, so browser storage is fine. */
const dismissKey = (courseId: string) => `apsara:rate-prompt-dismissed:${courseId}`

function isDismissed(courseId: string) {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(dismissKey(courseId)) === "1"
  } catch {
    return false
  }
}

/**
 * Asks for a rating at the moments a learner is most likely to give one —
 * finishing the course, or a strong quiz score. Hidden once they have rated
 * or dismissed it. One tap saves the stars; the written review stays optional
 * on the course page.
 */
export function RatePrompt({
  courseId,
  courseSlug,
  courseTitle,
  reason,
}: {
  courseId: string
  courseSlug: string
  courseTitle: string
  reason: "completed" | "quiz"
}) {
  const t = useTranslations("ratePrompt")
  const [state, setState] = useState<"checking" | "ask" | "saving" | "thanks" | "hidden">(() =>
    isDismissed(courseId) ? "hidden" : "checking"
  )
  const [stars, setStars] = useState(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (isDismissed(courseId)) return
    let active = true
    getMyRating(courseId)
      .then((mine) => active && setState(mine ? "hidden" : "ask"))
      .catch(() => active && setState("hidden"))
    return () => {
      active = false
    }
  }, [courseId])

  if (state === "checking" || state === "hidden") return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(dismissKey(courseId), "1")
    } catch {
      /* Private mode — the prompt simply returns next time. */
    }
    setState("hidden")
  }

  const rate = async (value: number) => {
    setStars(value)
    setFailed(false)
    setState("saving")
    try {
      await rateCourse(courseId, value)
      setState("thanks")
    } catch {
      setFailed(true)
      setState("ask")
    }
  }

  return (
    <div
      data-testid="rate-prompt"
      className="relative mt-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-500/25 dark:bg-amber-500/10"
    >
      {state !== "thanks" && (
        <button
          type="button"
          onClick={dismiss}
          aria-label={t("dismiss")}
          className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground hover:bg-amber-100 hover:text-foreground dark:hover:bg-amber-500/20"
        >
          <X className="size-4" />
        </button>
      )}

      {state === "thanks" ? (
        <div className="flex flex-wrap items-center gap-3">
          <Star className="size-5 fill-amber-400 text-amber-400" />
          <p className="text-sm font-semibold text-foreground">{t("thanks")}</p>
          <Link
            href={`/courses/${encodeURIComponent(courseSlug)}#ratings`}
            className="text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            {t("addReview")}
          </Link>
        </div>
      ) : (
        <>
          <p className="pr-8 text-sm font-semibold text-foreground">
            {reason === "completed"
              ? t("completedTitle", { course: courseTitle })
              : t("quizTitle", { course: courseTitle })}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t("body")}</p>
          <div className="mt-3" aria-busy={state === "saving"}>
            <StarRating value={stars} onChange={state === "saving" ? undefined : (v) => void rate(v)} size="lg" />
          </div>
          {failed && <p className="mt-2 text-xs text-destructive">{t("error")}</p>}
        </>
      )}
    </div>
  )
}
