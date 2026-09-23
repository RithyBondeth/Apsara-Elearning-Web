/** Mirrors `ContinueLearningDTO` on the api-gateway. */

export interface IApiContinueLesson {
  id: string
  slug: string
  title: string
  /** Title of the module the lesson sits in. */
  moduleTitle?: string | null
}

export interface IApiContinueLearning {
  courseId: string
  courseSlug: string
  courseTitle: string
  courseTitleKm?: string | null
  thumbnail?: string | null
  progressPercent: number
  totalLessons: number
  completedLessons: number
  /** First lesson not yet completed; null when the course has no lessons. */
  nextLesson: IApiContinueLesson | null
  /** Last time the learner made progress — the ordering key. */
  lastActivityAt: string
}
