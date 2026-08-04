/** Mirrors CourseResponseDTO in apsara-elearning-api (libs/contracts). */
export interface IApiCourse {
  id: string
  programType: "k12" | "university" | "programming"
  title: string
  titleKm?: string
  slug: string
  subjectId?: string
  gradeLevelId?: string
  majorId?: string
  categoryId?: string
  description?: string
  descriptionKm?: string
  thumbnail?: string
  difficulty?: "beginner" | "intermediate" | "advanced"
  estimatedHours?: number
  published?: boolean
  requiresSubscription?: boolean
  requiredEntitlement?: "courses:premium" | "ai:tutor" | "certificates"
  /** Totals the API attaches to catalog listings — no follow-up calls needed. */
  moduleCount?: number
  lessonCount?: number
  createdAt: string
  updatedAt: string
}

/** Mirrors SubjectResponseDTO. */
export interface IApiSubject {
  id: string
  name: string
  nameKm?: string
  slug: string
  description?: string
  descriptionKm?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

/** Mirrors GradeLevelResponseDTO. */
export interface IApiGradeLevel {
  id: string
  stage: "primary" | "lower_secondary" | "upper_secondary"
  grade: number
  name: string
  nameKm?: string
  order?: number
  createdAt: string
  updatedAt: string
}

/** Mirrors ProgrammingCategoryResponseDTO. */
export interface IApiProgrammingCategory {
  id: string
  name: string
  nameKm?: string
  slug: string
  description?: string
  descriptionKm?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

/** Mirrors FacultyResponseDTO. */
export interface IApiFaculty {
  id: string
  name: string
  nameKm?: string
  slug: string
  description?: string
  icon?: string
  createdAt: string
  updatedAt: string
}

/** Mirrors ModuleResponseDTO. */
export interface IApiModule {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
}

/** Mirrors LessonResponseDTO. */
export interface IApiLesson {
  id: string
  moduleId: string
  title: string
  slug: string
  type?: "article" | "video" | "interactive"
  content?: string
  videoUrl?: string
  order?: number
  estimatedMinutes?: number
  locked?: boolean
}

/** A module with its lessons attached, sorted by `order`. Mirrors ModuleWithLessonsResponseDTO. */
export interface IApiModuleWithLessons extends IApiModule {
  lessons: IApiLesson[]
}
