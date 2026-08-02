import { apiGet } from "./client"
import type {
  IApiCourse,
  IApiSubject,
  IApiGradeLevel,
  IApiProgrammingCategory,
  IApiFaculty,
  IApiModule,
  IApiModuleWithLessons,
  IApiLesson,
} from "@/utils/interfaces/catalog/api.interface"

export const getSubjects = () => apiGet<IApiSubject[]>("/subject")
export const getGradeLevels = () => apiGet<IApiGradeLevel[]>("/grade-level")
export const getProgrammingCategories = () =>
  apiGet<IApiProgrammingCategory[]>("/programming-category")
export const getFaculties = () => apiGet<IApiFaculty[]>("/faculty")
export const getCourses = () => apiGet<IApiCourse[]>("/course/published")
/** Keyword search over published courses. */
export const searchCourses = (q: string, limit = 8) =>
  apiGet<IApiCourse[]>(
    `/course/search?q=${encodeURIComponent(q)}&limit=${limit}`
  )
export const getCourseBySlug = (slug: string) =>
  apiGet<IApiCourse>(`/course/slug/${slug}`)
export const getCourseById = (id: string) => apiGet<IApiCourse>(`/course/${id}`)

export const getCourseModules = (courseId: string) =>
  apiGet<IApiModule[]>(`/module?courseId=${courseId}`)
export const getModuleLessons = (moduleId: string) =>
  apiGet<IApiLesson[]>(`/lesson?moduleId=${moduleId}`)
export const getLessonBySlug = (slug: string) =>
  apiGet<IApiLesson>(`/lesson/slug/${slug}`)

/** Total lesson count for a course — walks course → modules → lessons. */
export async function getCourseLessonCount(courseId: string): Promise<number> {
  const modules = await getCourseModules(courseId)
  const counts = await Promise.all(
    modules.map((m) => getModuleLessons(m.id).then((lessons) => lessons.length))
  )
  return counts.reduce((sum, n) => sum + n, 0)
}

/** Full course outline — modules with their lessons attached, in `order`. */
export async function getCourseStructure(courseId: string): Promise<IApiModuleWithLessons[]> {
  const modules = await getCourseModules(courseId)
  const withLessons = await Promise.all(
    [...modules]
      .sort((a, b) => a.order - b.order)
      .map(async (m) => ({
        ...m,
        lessons: (await getModuleLessons(m.id)).sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        ),
      }))
  )
  return withLessons
}
