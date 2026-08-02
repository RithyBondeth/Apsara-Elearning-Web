import type { IApiEnrollment } from "../enrollment/api.interface"

/** Mirrors LessonProgressResponseDTO in apsara-elearning-api (libs/contracts). */
export interface IApiLessonProgress {
  id: string
  userId: string
  lessonId: string
  completed: boolean
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

/** Shape of `POST /lesson-progress/lesson/:lessonId`. */
export interface IApiMarkCompleteResult {
  lessonId: string
  completed: boolean
  /** The enrollment with its progressPercent already recalculated. */
  enrollment: IApiEnrollment
  /** 10 the first time a lesson is completed, 0 on repeats. */
  xpAwarded: number
}
