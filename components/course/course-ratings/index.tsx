"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar } from "@/components/utils/avatar"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { StarRating } from "./star-rating"
import {
  getCourseRatings,
  getMyRating,
  rateCourse,
} from "@/lib/api/rating"
import { timeAgo } from "@/utils/functions/time"
import type {
  IApiRating,
  IApiRatingSummary,
} from "@/utils/interfaces/rating/api.interface"

/**
 * Ratings and reviews for a course.
 *
 * Renders nothing at all when a course has no ratings and the viewer cannot
 * add one — an empty "0.0 ★" or a placeholder review would be fabricated
 * social proof, which this site deliberately avoids.
 */
export function CourseRatings({
  courseId,
  canRate,
}: {
  courseId: string
  /** True when the viewer is enrolled — the API requires it to rate. */
  canRate: boolean
}) {
  const t = useTranslations("courseRatings")
  const [summary, setSummary] = useState<IApiRatingSummary | null>(null)
  const [mine, setMine] = useState<IApiRating | null>(null)
  const [draft, setDraft] = useState(0)
  const [review, setReview] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    void getCourseRatings(courseId)
      .then((data) => !cancelled && setSummary(data))
      .catch(() => !cancelled && setSummary({ average: null, count: 0, distribution: {}, items: [] }))
    return () => {
      cancelled = true
    }
  }, [courseId])

  useEffect(() => {
    if (!canRate) return
    let cancelled = false
    void getMyRating(courseId)
      .then((data) => {
        if (cancelled || !data) return
        setMine(data)
        setDraft(data.rating)
        setReview(data.review ?? "")
      })
      .catch(() => {
        /* Not rated yet, or no session — the form just opens empty. */
      })
    return () => {
      cancelled = true
    }
  }, [courseId, canRate])

  async function submit() {
    if (draft < 1) return
    setSaving(true)
    try {
      const saved = await rateCourse(courseId, draft, review.trim() || undefined)
      setMine(saved)
      setSummary(await getCourseRatings(courseId))
    } catch {
      /* Leave the draft in place so the learner can retry. */
    } finally {
      setSaving(false)
    }
  }

  // Nothing rated and nothing the viewer can do — show no section at all
  // rather than an empty shell implying an unrated course scored zero.
  if (summary && summary.count === 0 && !canRate) return null

  return (
    <section id="ratings" className="scroll-mt-24 space-y-4">
      <TypographyH3 className="text-lg font-semibold">
        {t("title")}
      </TypographyH3>

      {summary === null && (
        <div className="flex justify-center py-8 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
        </div>
      )}

      {summary && summary.count > 0 && (
        <Card className="flex flex-wrap items-center gap-4 p-5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tabular-nums text-foreground">
              {summary.average?.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          <div>
            <StarRating value={summary.average ?? 0} />
            <TypographyMuted className="mt-1 text-xs">
              {t("count", { count: summary.count })}
            </TypographyMuted>
          </div>
        </Card>
      )}

      {summary && summary.count === 0 && canRate && (
        <TypographyMuted className="text-sm">{t("beFirst")}</TypographyMuted>
      )}

      {canRate && (
        <Card className="space-y-3 p-5">
          <p className="text-sm font-medium text-foreground">
            {mine ? t("editYours") : t("addYours")}
          </p>
          <StarRating value={draft} onChange={setDraft} size="lg" />
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder={t("reviewPlaceholder")}
            className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-violet-500/40"
          />
          <p className="text-xs text-muted-foreground">{t("featuredNote")}</p>
          <Button onClick={() => void submit()} disabled={draft < 1 || saving} className="gap-2">
            {saving && <Loader2 className="size-4 animate-spin" />}
            {t("submit")}
          </Button>
        </Card>
      )}

      {summary && summary.items.length > 0 && (
        <div className="space-y-3">
          {summary.items.map((item) => (
            <Card key={item.id} className="flex items-start gap-3 p-4">
              <Avatar preset={item.avatar} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {item.displayName}
                  </span>
                  <StarRating value={item.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(item.createdAt)}
                  </span>
                </div>
                {item.review && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.review}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
