import type { IApiCourse } from "@/utils/interfaces/catalog/api.interface"

/** Mirrors `XP_PER_LESSON` in the API's lesson-progress.service. */
export const XP_PER_LESSON = 10

/**
 * Pick the courses the landing page showcases: the published courses with the
 * most lessons, so the section always advertises real, substantial content.
 * Courses with no lessons yet are skipped; ties break on title for a stable order.
 */
export function pickFeaturedCourses(courses: IApiCourse[], limit = 3): IApiCourse[] {
  return courses
    .filter((c) => c.published !== false && (c.lessonCount ?? 0) > 0)
    .sort(
      (a, b) =>
        (b.lessonCount ?? 0) - (a.lessonCount ?? 0) || a.title.localeCompare(b.title)
    )
    .slice(0, limit)
}

/** XP a learner earns from completing every lesson in a course. */
export function lessonXp(course: Pick<IApiCourse, "lessonCount">): number {
  return (course.lessonCount ?? 0) * XP_PER_LESSON
}
