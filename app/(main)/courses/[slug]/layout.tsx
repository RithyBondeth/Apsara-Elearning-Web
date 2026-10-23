import type { Metadata } from "next"
import { fetchPublic } from "@/lib/api/public"
import { summarize } from "@/lib/seo/summarize"
import type { IApiCourse } from "@/utils/interfaces/catalog/api.interface"

/**
 * Server-side metadata for a course page. The page itself renders in the
 * browser, so without this every course showed the site's generic title in
 * search results and link previews.
 *
 * Uses the published-only lookup, anonymously: a draft never leaks its title.
 */
const SITE_NAME = "Apsara Elearning"
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await fetchPublic<IApiCourse>(
    `/course/slug/${encodeURIComponent(slug)}`,
    600
  )
  /* Unknown, unpublished, or API unreachable: keep the site defaults, but
     don't let a dead URL be indexed. */
  if (!course) return { robots: { index: false } }

  const title = `${course.title} — ${SITE_NAME}`
  const source = course.description ?? course.descriptionKm
  const description = source ? summarize(source) : undefined
  const url = `/courses/${encodeURIComponent(course.slug)}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      ...(course.thumbnail ? { images: [course.thumbnail] } : {}),
    },
    twitter: {
      card: course.thumbnail ? "summary_large_image" : "summary",
      title,
      description,
    },
  }
}

export default function CourseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
