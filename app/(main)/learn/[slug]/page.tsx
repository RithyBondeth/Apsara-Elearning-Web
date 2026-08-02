import { notFound } from "next/navigation"
import { ApiLessonReader } from "@/components/learn/api-lesson-reader"
import { getCourseBySlug } from "@/lib/api/catalog"

interface LearnCoursePageProps {
  params: Promise<{ slug: string }>
}

export default async function LearnCoursePage({ params }: LearnCoursePageProps) {
  const { slug } = await params

  /* Fully API-backed — an unknown slug is a 404, no mock fallback. */
  const apiCourse = await getCourseBySlug(slug).catch(() => null)
  if (!apiCourse) notFound()

  return <ApiLessonReader slug={slug} />
}
