import { redirect } from "next/navigation"
import { getMyEnrollments } from "@/lib/api/enrollment"
import { getCourseById } from "@/lib/api/catalog"

/** Bare /learn means "resume" — send the student to their most recent course. */
export default async function LearnPage() {
  /* Enrollments come back oldest-first, so the newest is the last entry. */
  const enrollments = await getMyEnrollments().catch(() => [])
  const latest = enrollments[enrollments.length - 1]

  if (latest) {
    const course = await getCourseById(latest.courseId).catch(() => null)
    if (course) redirect(`/learn/${course.slug}`)
  }

  /* No enrollments yet — there's nothing to resume, so send them to browse. */
  redirect("/courses")
}
