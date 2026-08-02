import { apiDelete, apiGet, apiPost } from "./client"
import type {
  IApiEnrollment,
  IApiEnrollmentCheck,
} from "@/utils/interfaces/enrollment/api.interface"

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
