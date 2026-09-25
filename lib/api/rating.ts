import { apiDelete, apiGet, apiPut } from "./client"
import type {
  IApiRating,
  IApiRatingSummary,
} from "@/utils/interfaces/rating/api.interface"

/** Public — the summary is social proof on a public course page. */
export const getCourseRatings = (courseId: string, limit?: number) =>
  apiGet<IApiRatingSummary>(
    limit
      ? `/course/${courseId}/ratings?limit=${limit}`
      : `/course/${courseId}/ratings`
  )

/** Authenticated. Null when the learner has not rated this course. */
export const getMyRating = (courseId: string) =>
  apiGet<IApiRating | null>(`/course/${courseId}/rating/me`)

/** Authenticated; the gateway also requires an enrollment. */
export const rateCourse = (
  courseId: string,
  rating: number,
  review?: string
) => apiPut<IApiRating>(`/course/${courseId}/rating`, { rating, review })

export const removeMyRating = (courseId: string) =>
  apiDelete<{ message: string; id: string }>(`/course/${courseId}/rating`)
