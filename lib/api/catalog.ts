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

/**
 * Full course outline — modules with their lessons attached, already ordered.
 *
 * One request. This used to walk course → modules → lessons client-side, which
 * cost 1 + N calls per course; the catalog did it for every course on screen
 * and the dashboard for every enrolment, so a single page load could fire well
 * over a hundred requests through the proxy.
 */
export const getCourseStructure = (courseId: string) =>
  apiGet<IApiModuleWithLessons[]>(`/course/${courseId}/structure`)
