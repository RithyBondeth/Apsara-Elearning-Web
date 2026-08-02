"use client"

import { useEffect, useState } from "react"
import { getCourseById, getCourseStructure } from "@/lib/api/catalog"
import { getMyEnrollments } from "@/lib/api/enrollment"
import { getMyLessonProgress } from "@/lib/api/lesson-progress"
import type { IApiCourse, IApiLesson } from "@/utils/interfaces/catalog/api.interface"
import type { IApiEnrollment } from "@/utils/interfaces/enrollment/api.interface"

export interface IMyCourse {
  course: IApiCourse
  enrollment: IApiEnrollment
  totalLessons: number
  completedLessons: number
  /** First uncompleted lesson — where "continue" should land. Null for empty courses. */
  nextLesson: IApiLesson | null
}

/**
 * The student's enrolled courses with real progress, newest enrollment first.
 * Returns `null` while loading; an empty array means no enrollments (or guest).
 */
export function useMyCourses(): IMyCourse[] | null {
  const [courses, setCourses] = useState<IMyCourse[] | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const [enrollments, progress] = await Promise.all([
          getMyEnrollments(),
          getMyLessonProgress().catch(() => []),
        ])
        const done = new Set(
          progress.filter((p) => p.completed).map((p) => p.lessonId)
        )
        const items = await Promise.all(
          [...enrollments].reverse().map(async (enrollment) => {
            const course = await getCourseById(enrollment.courseId)
            const structure = await getCourseStructure(course.id)
            const lessons = structure.flatMap((m) => m.lessons)
            const completedLessons = lessons.filter((l) => done.has(l.id)).length
            const nextLesson =
              lessons.find((l) => !done.has(l.id)) ?? lessons.at(-1) ?? null
            return {
              course,
              enrollment,
              totalLessons: lessons.length,
              completedLessons,
              nextLesson,
            }
          })
        )
        if (!cancelled) setCourses(items)
      } catch {
        /* Guest or expired session — the dashboard shows the empty state. */
        if (!cancelled) setCourses([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return courses
}
