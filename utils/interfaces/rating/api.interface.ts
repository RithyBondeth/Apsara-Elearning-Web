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
