import { apiGet, apiPost } from "./client"
import type {
  IApiLessonProgress,
  IApiMarkCompleteResult,
} from "@/utils/interfaces/lesson-progress/api.interface"

/**
 * Both endpoints require an authenticated session — the gateway resolves the
 * user from the JWT. Marking complete requires an enrollment in the lesson's
 * course; the backend also recalculates the enrollment's progressPercent and
 * awards first-time XP in the same call, so no follow-up requests are needed.
 */

export const markLessonComplete = (lessonId: string) =>
  apiPost<IApiMarkCompleteResult>(`/lesson-progress/lesson/${lessonId}`)

export const getMyLessonProgress = () =>
  apiGet<IApiLessonProgress[]>("/lesson-progress")
