import { adminDelete, adminGet, adminPatch, adminPost } from "./client"
import type {
  IAdminBadge,
  IAdminChallenge,
  IAdminCourse,
  IAdminEntitlementGrant,
  IAdminFaculty,
  IAdminGradeLevel,
  IAdminLesson,
  IAdminMajor,
  IAdminModule,
  IAdminOption,
  IAdminPlan,
  IAdminProgrammingCategory,
  IAdminQuestion,
  IAdminQuiz,
  IAdminResolvedEntitlement,
  IAdminSubject,
  IAdminTestCase,
  IAdminUser,
} from "@/utils/interfaces/admin/api.interface"

/**
 * Every admin-gateway endpoint, one thin wrapper each.
 *
 * Paths are relative to the gateway's `/admin` prefix, which lives in
 * `ADMIN_API_URL` — so they read exactly as the controllers declare them.
 *
 * Create/update payloads are `Partial<T>` minus the server-owned fields. The
 * gateway validates with `forbidNonWhitelisted`, so callers must not spread a
 * whole response object back into an update — send only the edited fields.
 */

/* Server-owned fields never accepted on write. */
type TWritable<T> = Omit<T, "id" | "createdAt" | "updatedAt">

/* ── Taxonomy ─────────────────────────────────────────────────────────── */

export const listSubjects = () => adminGet<IAdminSubject[]>("/subjects")
export const createSubject = (body: Partial<TWritable<IAdminSubject>>) =>
  adminPost<IAdminSubject>("/subjects", body)
export const updateSubject = (
  id: string,
  body: Partial<TWritable<IAdminSubject>>
) => adminPatch<IAdminSubject>(`/subjects/${id}`, body)
export const deleteSubject = (id: string) => adminDelete(`/subjects/${id}`)

export const listGradeLevels = () => adminGet<IAdminGradeLevel[]>("/grade-levels")
export const createGradeLevel = (body: Partial<TWritable<IAdminGradeLevel>>) =>
  adminPost<IAdminGradeLevel>("/grade-levels", body)
export const updateGradeLevel = (
  id: string,
  body: Partial<TWritable<IAdminGradeLevel>>
) => adminPatch<IAdminGradeLevel>(`/grade-levels/${id}`, body)
export const deleteGradeLevel = (id: string) =>
  adminDelete(`/grade-levels/${id}`)

export const listFaculties = () => adminGet<IAdminFaculty[]>("/faculties")
export const createFaculty = (body: Partial<TWritable<IAdminFaculty>>) =>
  adminPost<IAdminFaculty>("/faculties", body)
export const updateFaculty = (
  id: string,
  body: Partial<TWritable<IAdminFaculty>>
) => adminPatch<IAdminFaculty>(`/faculties/${id}`, body)
export const deleteFaculty = (id: string) => adminDelete(`/faculties/${id}`)

export const listMajors = () => adminGet<IAdminMajor[]>("/majors")
export const createMajor = (body: Partial<TWritable<IAdminMajor>>) =>
  adminPost<IAdminMajor>("/majors", body)
export const updateMajor = (id: string, body: Partial<TWritable<IAdminMajor>>) =>
  adminPatch<IAdminMajor>(`/majors/${id}`, body)
export const deleteMajor = (id: string) => adminDelete(`/majors/${id}`)

export const listProgrammingCategories = () =>
  adminGet<IAdminProgrammingCategory[]>("/programming-categories")
export const createProgrammingCategory = (
  body: Partial<TWritable<IAdminProgrammingCategory>>
) => adminPost<IAdminProgrammingCategory>("/programming-categories", body)
export const updateProgrammingCategory = (
  id: string,
  body: Partial<TWritable<IAdminProgrammingCategory>>
) =>
  adminPatch<IAdminProgrammingCategory>(`/programming-categories/${id}`, body)
export const deleteProgrammingCategory = (id: string) =>
  adminDelete(`/programming-categories/${id}`)

/* ── Courses ──────────────────────────────────────────────────────────── */

export const listCourses = () => adminGet<IAdminCourse[]>("/courses")
export const getCourse = (id: string) => adminGet<IAdminCourse>(`/courses/${id}`)
export const createCourse = (body: Partial<TWritable<IAdminCourse>>) =>
  adminPost<IAdminCourse>("/courses", body)
export const updateCourse = (
  id: string,
  body: Partial<TWritable<IAdminCourse>>
) => adminPatch<IAdminCourse>(`/courses/${id}`, body)
export const deleteCourse = (id: string) => adminDelete(`/courses/${id}`)

/* ── Modules (nested under a course) ──────────────────────────────────── */

export const listModules = (courseId: string) =>
  adminGet<IAdminModule[]>(`/courses/${courseId}/modules`)
export const createModule = (
  courseId: string,
  body: Partial<TWritable<IAdminModule>>
) => adminPost<IAdminModule>(`/courses/${courseId}/modules`, body)
export const updateModule = (
  courseId: string,
  id: string,
  body: Partial<TWritable<IAdminModule>>
) => adminPatch<IAdminModule>(`/courses/${courseId}/modules/${id}`, body)
export const deleteModule = (courseId: string, id: string) =>
  adminDelete(`/courses/${courseId}/modules/${id}`)
/** Persists a drag-reorder. Ids in their new order. */
export const reorderModules = (courseId: string, orderedIds: string[]) =>
  adminPatch<IAdminModule[]>(`/courses/${courseId}/modules/reorder`, {
    orderedIds,
  })

/* ── Lessons (nested under a module) ──────────────────────────────────── */

export const listLessons = (moduleId: string) =>
  adminGet<IAdminLesson[]>(`/modules/${moduleId}/lessons`)
export const getLesson = (moduleId: string, id: string) =>
  adminGet<IAdminLesson>(`/modules/${moduleId}/lessons/${id}`)
export const createLesson = (
  moduleId: string,
  body: Partial<TWritable<IAdminLesson>>
) => adminPost<IAdminLesson>(`/modules/${moduleId}/lessons`, body)
export const updateLesson = (
  moduleId: string,
  id: string,
  body: Partial<TWritable<IAdminLesson>>
) => adminPatch<IAdminLesson>(`/modules/${moduleId}/lessons/${id}`, body)
export const deleteLesson = (moduleId: string, id: string) =>
  adminDelete(`/modules/${moduleId}/lessons/${id}`)
export const reorderLessons = (moduleId: string, orderedIds: string[]) =>
  adminPatch<IAdminLesson[]>(`/modules/${moduleId}/lessons/reorder`, {
    orderedIds,
  })

/* ── Quizzes (nested under a lesson) ──────────────────────────────────── */

export const listQuizzes = (lessonId: string) =>
  adminGet<IAdminQuiz[]>(`/lessons/${lessonId}/quizzes`)
export const createQuiz = (
  lessonId: string,
  body: Partial<TWritable<IAdminQuiz>>
) => adminPost<IAdminQuiz>(`/lessons/${lessonId}/quizzes`, body)
export const updateQuiz = (id: string, body: Partial<TWritable<IAdminQuiz>>) =>
  adminPatch<IAdminQuiz>(`/quizzes/${id}`, body)
export const deleteQuiz = (id: string) => adminDelete(`/quizzes/${id}`)

export const listQuestions = (quizId: string) =>
  adminGet<IAdminQuestion[]>(`/quizzes/${quizId}/questions`)
export const createQuestion = (
  quizId: string,
  body: Partial<TWritable<IAdminQuestion>>
) => adminPost<IAdminQuestion>(`/quizzes/${quizId}/questions`, body)
export const updateQuestion = (
  id: string,
  body: Partial<TWritable<IAdminQuestion>>
) => adminPatch<IAdminQuestion>(`/questions/${id}`, body)
export const deleteQuestion = (id: string) => adminDelete(`/questions/${id}`)
export const reorderQuestions = (orderedIds: string[]) =>
  adminPatch<IAdminQuestion[]>("/questions/reorder", { orderedIds })

export const listOptions = (questionId: string) =>
  adminGet<IAdminOption[]>(`/questions/${questionId}/options`)
export const createOption = (
  questionId: string,
  body: Partial<TWritable<IAdminOption>>
) => adminPost<IAdminOption>(`/questions/${questionId}/options`, body)
export const updateOption = (
  id: string,
  body: Partial<TWritable<IAdminOption>>
) => adminPatch<IAdminOption>(`/options/${id}`, body)
export const deleteOption = (id: string) => adminDelete(`/options/${id}`)

/* ── Coding challenges (nested under a lesson) ────────────────────────── */

export const listChallenges = (lessonId: string) =>
  adminGet<IAdminChallenge[]>(`/lessons/${lessonId}/challenges`)
export const createChallenge = (
  lessonId: string,
  body: Partial<TWritable<IAdminChallenge>>
) => adminPost<IAdminChallenge>(`/lessons/${lessonId}/challenges`, body)
export const updateChallenge = (
  id: string,
  body: Partial<TWritable<IAdminChallenge>>
) => adminPatch<IAdminChallenge>(`/challenges/${id}`, body)
export const deleteChallenge = (id: string) => adminDelete(`/challenges/${id}`)

export const listTestCases = (challengeId: string) =>
  adminGet<IAdminTestCase[]>(`/challenges/${challengeId}/test-cases`)
export const createTestCase = (
  challengeId: string,
  body: Partial<TWritable<IAdminTestCase>>
) => adminPost<IAdminTestCase>(`/challenges/${challengeId}/test-cases`, body)
export const updateTestCase = (
  id: string,
  body: Partial<TWritable<IAdminTestCase>>
) => adminPatch<IAdminTestCase>(`/test-cases/${id}`, body)
export const deleteTestCase = (id: string) => adminDelete(`/test-cases/${id}`)

/* ── Users ────────────────────────────────────────────────────────────── */

export const listUsers = () => adminGet<IAdminUser[]>("/users")
export const getUser = (id: string) => adminGet<IAdminUser>(`/users/${id}`)
export const deleteUser = (id: string) => adminDelete(`/users/${id}`)

/* ── Badges ───────────────────────────────────────────────────────────── */

export const listBadges = () => adminGet<IAdminBadge[]>("/badges")
export const createBadge = (body: Partial<TWritable<IAdminBadge>>) =>
  adminPost<IAdminBadge>("/badges", body)
export const updateBadge = (id: string, body: Partial<TWritable<IAdminBadge>>) =>
  adminPatch<IAdminBadge>(`/badges/${id}`, body)
export const deleteBadge = (id: string) => adminDelete(`/badges/${id}`)
/** Grants a badge outright, bypassing the XP ladder. */
export const awardBadge = (badgeId: string, userId: string) =>
  adminPost<{ userId: string; badgeId: string; alreadyOwned?: boolean }>(
    `/badges/${badgeId}/award/${userId}`
  )
/** Undoes {@link awardBadge}. */
export const revokeBadge = (badgeId: string, userId: string) =>
  adminDelete(`/badges/${badgeId}/award/${userId}`)

/* ── Plans ────────────────────────────────────────────────────────────── */

export const listPlans = () => adminGet<IAdminPlan[]>("/plans")
export const createPlan = (body: Partial<TWritable<IAdminPlan>>) =>
  adminPost<IAdminPlan>("/plans", body)
export const updatePlan = (id: string, body: Partial<TWritable<IAdminPlan>>) =>
  adminPatch<IAdminPlan>(`/plans/${id}`, body)
export const deletePlan = (id: string) => adminDelete(`/plans/${id}`)

/* ── Entitlement grants ───────────────────────────────────────────────── */

/** What the user actually resolves to today, plan and grants combined. */
export const resolveEntitlements = (userId: string) =>
  adminGet<IAdminResolvedEntitlement[]>(`/entitlements/users/${userId}`)
export const listGrants = (userId: string) =>
  adminGet<IAdminEntitlementGrant[]>(`/entitlements/users/${userId}/grants`)
export const createGrant = (
  userId: string,
  body: {
    entitlement: string
    effect?: "allow" | "deny"
    startsAt?: string
    expiresAt?: string
    reason: string
  }
) =>
  adminPost<IAdminEntitlementGrant>(
    `/entitlements/users/${userId}/grants`,
    body
  )
export const deleteGrant = (id: string) =>
  adminDelete(`/entitlements/grants/${id}`)
