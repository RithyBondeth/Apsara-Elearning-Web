/** Mirrors EnrollmentResponseDTO in apsara-elearning-api (libs/contracts). */
export interface IApiEnrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
  completedAt?: string | null
  progressPercent: number
  completed: boolean
  createdAt: string
  updatedAt: string
}

/** Shape of `GET /enrollment/check/:courseId`. */
export interface IApiEnrollmentCheck {
  enrolled: boolean
  enrollment: IApiEnrollment | null
}
