"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Switch } from "@/components/ui/switch"
import { StarRating } from "@/components/course/course-ratings/star-rating"
import { listReviews, setReviewFeatured } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { MIN_FEATURED_REVIEWS } from "@/components/landing/landing-reviews"
import type { IAdminReview } from "@/utils/interfaces/admin/api.interface"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<IAdminReview[] | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "featured">("all")

  useEffect(() => {
    listReviews().then(setReviews, () => {
      toast.error("Could not load reviews")
      setReviews([])
    })
  }, [])

  async function toggle(review: IAdminReview, featured: boolean) {
    setBusyId(review.id)
    try {
      const updated = await setReviewFeatured(review.id, featured)
      setReviews((list) => list?.map((r) => (r.id === updated.id ? updated : r)) ?? null)
      toast.success(featured ? "Featured on the landing page" : "Removed from the landing page")
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not update review")
    } finally {
      setBusyId(null)
    }
  }

  const featuredCount = reviews?.filter((r) => r.featured).length ?? 0
  const shown = filter === "featured" ? reviews?.filter((r) => r.featured) : reviews

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Written reviews from enrolled learners. Only reviews you feature appear on the
          landing page, and the section stays hidden until at least {MIN_FEATURED_REVIEWS} are
          featured. A learner editing a featured review takes it off the page until you
          feature it again.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground">
          {featuredCount} featured
          {featuredCount < MIN_FEATURED_REVIEWS &&
            ` — ${MIN_FEATURED_REVIEWS - featuredCount} more needed to show the section`}
        </span>
        <div className="ml-auto flex gap-1">
          {(["all", "featured"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 capitalize ${
                filter === f ? "bg-muted font-medium text-foreground" : "text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!reviews ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : shown && shown.length > 0 ? (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {shown.map((review) => (
            <li key={review.id} className="flex items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <StarRating value={review.rating} size="sm" />
                  <span className="font-medium text-foreground">{review.displayName}</span>
                  <span className="text-muted-foreground">{review.email}</span>
                  <span className="text-muted-foreground">· {review.courseTitle}</span>
                </div>
                <p className="mt-1.5 text-sm text-foreground">{review.review}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {new Date(review.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                {busyId === review.id && <Loader2 className="size-3 animate-spin" />}
                Featured
                <Switch
                  checked={review.featured}
                  disabled={busyId === review.id}
                  onCheckedChange={(checked) => void toggle(review, checked)}
                  aria-label={`Feature review by ${review.displayName}`}
                />
              </label>
            </li>
          ))}
        </ul>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {filter === "featured" ? "No featured reviews yet." : "No written reviews yet."}
        </p>
      )}
    </div>
  )
}
