/**
 * Mirrors the admin-gateway DTOs in `libs/contracts/src/dtos`.
 *
 * The unions below are copied from the API's `@IsIn` constants — the gateway
 * runs `ValidationPipe` with `forbidNonWhitelisted`, so an unknown value or a
 * stray extra key is a 400, not a silently ignored field.
 */

/* ── Shared ───────────────────────────────────────────────────────────── */

export interface IApiDeleted {
  id: string
  deleted: boolean
}

export type TProgramType = "k12" | "university" | "programming"
export const PROGRAM_TYPES: TProgramType[] = ["k12", "university", "programming"]

export type TCourseDifficulty = "beginner" | "intermediate" | "advanced"
export const COURSE_DIFFICULTIES: TCourseDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
]

export type TLessonType = "article" | "video" | "interactive"
export const LESSON_TYPES: TLessonType[] = ["article", "video", "interactive"]

export type TEducationStage = "primary" | "lower_secondary" | "upper_secondary"
export const EDUCATION_STAGES: TEducationStage[] = [
  "primary",
  "lower_secondary",
  "upper_secondary",
]

export type TBillingPeriod = "monthly" | "yearly" | "lifetime"
export const BILLING_PERIODS: TBillingPeriod[] = [
  "monthly",
  "yearly",
  "lifetime",
]

export type TEntitlementKey = "courses:premium" | "ai:tutor" | "certificates"
export const ENTITLEMENTS: TEntitlementKey[] = [
  "courses:premium",
  "ai:tutor",
  "certificates",
]

export type TQuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "matching"
  | "numeric"
export const QUESTION_TYPES: TQuestionType[] = [
  "multiple_choice",
  "true_false",
  "fill_blank",
  "short_answer",
  "matching",
  "numeric",
]

/* ── Taxonomy ─────────────────────────────────────────────────────────── */

export interface IAdminSubject {
  id: string
  name: string
  nameKm?: string
  slug: string
  description?: string
  descriptionKm?: string
  icon?: string
}

export interface IAdminGradeLevel {
  id: string
  stage: TEducationStage
  grade: number
  name: string
  nameKm?: string
  order?: number
}

export interface IAdminFaculty {
  id: string
  name: string
  nameKm?: string
  slug: string
  description?: string
  icon?: string
}

export interface IAdminMajor {
  id: string
  name: string
  nameKm?: string
  slug: string
  facultyId?: string
  description?: string
}

export interface IAdminProgrammingCategory {
  id: string
  name: string
  nameKm?: string
  slug: string
  description?: string
  descriptionKm?: string
  icon?: string
}

/* ── Course tree ──────────────────────────────────────────────────────── */

export interface IAdminCourse {
  id: string
  programType?: TProgramType
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
  difficulty?: TCourseDifficulty
  estimatedHours?: number
  published?: boolean
  requiresSubscription?: boolean
  requiredEntitlement?: TEntitlementKey
  moduleCount?: number
  lessonCount?: number
  createdAt: string
  updatedAt: string
}

export interface IAdminModule {
  id: string
  courseId: string
  title: string
  description?: string
  order?: number
}

export interface IAdminLesson {
  id: string
  moduleId: string
  title: string
  slug: string
  type?: TLessonType
  content?: string
  videoUrl?: string
  order?: number
  estimatedMinutes?: number
}

/* ── Assessment ───────────────────────────────────────────────────────── */

export interface IAdminQuiz {
  id: string
  title: string
  description?: string
  xpReward?: number
}

export interface IAdminQuestion {
  id: string
  quizId: string
  type?: TQuestionType
  question: string
  /** Type-specific answer spec; unused for multiple_choice (correctness lives on options). */
  correctAnswer?: Record<string, unknown>
  explanation?: string
  points?: number
  order?: number
}

export interface IAdminOption {
  id: string
  questionId: string
  answer: string
  isCorrect?: boolean
}

export interface IAdminChallenge {
  id: string
  lessonId: string
  title: string
  description?: string
  starterCode?: string
  solutionCode?: string
  xpReward?: number
}

export interface IAdminTestCase {
  id: string
  challengeId: string
  input?: string
  expectedOutput: string
  isHidden?: boolean
  order?: number
}

/* ── People and commerce ──────────────────────────────────────────────── */

export interface IAdminUser {
  id: string
  firstName?: string
  lastName?: string
  gender?: string
  dateOfBirth?: string
  avatar?: string
  streak: number
  xp: number
  isAdmin: boolean
  email: string
  isEmailVerified: boolean
  phone?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface IAdminBadge {
  id: string
  name: string
  description?: string
  icon?: string
  xpRequired: number
}

export interface IAdminPlan {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  billingPeriod?: TBillingPeriod
  aiCredits?: number
  stripePriceId?: string
  entitlements: TEntitlementKey[]
  trialDays: number
  gracePeriodDays: number
}

export interface IAdminEntitlementGrant {
  id: string
  userId: string
  entitlement: TEntitlementKey
  effect: "allow" | "deny"
  startsAt?: string
  expiresAt?: string
  reason: string
  /** Set once revoked — the row stays in the list as an audit record. */
  revokedAt?: string | null
  createdAt: string
}

export interface IAdminResolvedEntitlement {
  entitlement: TEntitlementKey
  granted: boolean
  source: "administrative" | "plan" | "none"
  validUntil?: string | null
}
