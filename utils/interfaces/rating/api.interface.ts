/** Mirrors `RatingResponseDTO` / `RatingSummaryResponseDTO`. */

export interface IApiRating {
  id: string
  rating: number
  review?: string | null
  /** First name plus last initial; the API never sends a surname or email. */
  displayName: string
  avatar?: string | null
  createdAt: string
}

export interface IApiRatingSummary {
  /** Null — never 0 — when nothing has been rated. */
  average: number | null
  count: number
  /** Ratings per star, keyed "1".."5". */
  distribution: Record<string, number>
  /** Recent written reviews; ratings without text are excluded. */
  items: IApiRating[]
}

/** Mirrors `FeaturedReviewDTO` — an admin-featured review for the landing page. */
export interface IApiFeaturedReview extends IApiRating {
  courseTitle: string
  courseTitleKm?: string | null
  courseSlug: string
}

/** Mirrors `PublicTestimonialDTO` — a consented quote from a teacher or beta tester. */
export interface IApiTestimonial {
  id: string
  name: string
  role: string
  roleKm?: string | null
  quote: string
  quoteKm?: string | null
  avatar?: string | null
}

/** Mirrors `FeaturedReviewsResponseDTO`. `average`/`count` cover every rating, not only featured ones. */
export interface IApiFeaturedReviews {
  average: number | null
  count: number
  items: IApiFeaturedReview[]
  /** Published testimonials; older API builds may omit the field. */
  testimonials?: IApiTestimonial[]
}
