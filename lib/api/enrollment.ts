import { apiDelete, apiGet, apiPost } from "./client"
import type {
  IApiEnrollment,
  IApiEnrollmentCheck,
} from "@/utils/interfaces/enrollment/api.interface"
import type { IApiContinueLearning } from "@/utils/interfaces/continue-learning/api.interface"

/**
 * All enrollment endpoints require an authenticated session — the gateway
 * resolves the user from the JWT, so no userId is ever passed from here.
 */

export const enrollInCourse = (courseId: string) =>
  apiPost<IApiEnrollment>(`/enrollment/${courseId}`)

export const unenrollFromCourse = (courseId: string) =>
  apiDelete<{ message: string; courseId: string }>(`/enrollment/${courseId}`)

/** Ordered by `enrolledAt` ascending — the last entry is the newest. */
export const getMyEnrollments = () => apiGet<IApiEnrollment[]>("/enrollment")

export const checkEnrollment = (courseId: string) =>
  apiGet<IApiEnrollmentCheck>(`/enrollment/check/${courseId}`)

/**
 * In-progress courses with the next lesson to open, most recently *worked on*
 * first — not most recently enrolled.
 *
 * Resolved server-side in three queries; deriving it here used to cost two
 * requests per enrolled course.
 */
export const getContinueLearning = (limit?: number) =>
  apiGet<IApiContinueLearning[]>(
    limit ? `/enrollment/continue?limit=${limit}` : "/enrollment/continue"
  )
