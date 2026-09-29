"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, RotateCcw, TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { QuizReviewCard, QuizScoreCard } from "@/components/learn/quiz-review"
import { ApiError } from "@/lib/api/client"
import { getAttemptReview } from "@/lib/api/quiz"
import type { IApiQuizAttemptReview } from "@/utils/interfaces/quiz/api.interface"

/** A past quiz attempt re-opened from the activity history. */
export default function QuizAttemptReviewPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const t = useTranslations("activity")
  const tq = useTranslations("quiz")

  const [review, setReview] = useState<IApiQuizAttemptReview | null>(null)
  const [error, setError] = useState<"notFound" | "unavailable" | null>(null)

  useEffect(() => {
    let cancelled = false
    getAttemptReview(attemptId)
      .then((res) => {
        if (!cancelled) setReview(res)
      })
      .catch((err) => {
        if (cancelled) return
        // 400 = not submitted yet, 403 = lost access to the lesson.
        setError(
          err instanceof ApiError && err.status === 404
            ? "notFound"
            : "unavailable"
        )
      })
    return () => {
      cancelled = true
    }
  }, [attemptId])

  const attempt = review?.attempt
  const lessonHref =
    attempt?.courseSlug && attempt.lessonId
      ? `/learn/${attempt.courseSlug}/${attempt.lessonId}`
      : null

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link
          href="/activity"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t("backToActivity")}
        </Link>

        {!review && !error && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {error && (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-5 dark:border-amber-500/25 dark:bg-amber-500/10">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-muted-foreground">
              {error === "notFound"
                ? t("reviewNotFound")
                : t("reviewUnavailable")}
            </p>
          </Card>
        )}

        {review && attempt && (
          <>
            <AnimateIn animation="fade-up" delay={0.05}>
              <div>
                <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
                  {attempt.quizTitle ?? t("reviewTitle")}
                </TypographyH2>
                {attempt.lessonTitle && (
                  <TypographyMuted>{attempt.lessonTitle}</TypographyMuted>
                )}
              </div>
            </AnimateIn>

            <QuizScoreCard result={review} t={tq} />

            <div className="space-y-3">
              {review.review.map((item, i) => (
                <QuizReviewCard
                  key={item.questionId}
                  item={item}
                  index={i}
                  t={tq}
                />
              ))}
            </div>

            {lessonHref && (
              <Button asChild variant="outline" className="w-full">
                <Link href={lessonHref}>
                  <RotateCcw className="size-4" />
                  {t("retake")}
                </Link>
              </Button>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
