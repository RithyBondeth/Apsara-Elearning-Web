import { notFound } from "next/navigation"
import { ApiLessonReader } from "@/components/learn/api-lesson-reader"
import { getCourseBySlug } from "@/lib/api/catalog"

interface LearnLessonPageProps {
  params: Promise<{ slug: string; lessonId: string }>
}

export default async function LearnLessonPage({ params }: LearnLessonPageProps) {
  const { slug, lessonId } = await params

  /* Fully API-backed — an unknown slug is a 404, no mock fallback. The reader
     resolves `lessonId` (a lesson slug) against the real course structure. */
  const apiCourse = await getCourseBySlug(slug).catch(() => null)
  if (!apiCourse) notFound()

  return <ApiLessonReader slug={slug} initialLessonSlug={lessonId} />
}
