import type { MetadataRoute } from "next"
import { fetchPublic } from "@/lib/api/public"
import { siteUrl } from "@/lib/site-url"

/** Rebuilt at most hourly; a newly published course appears within the hour. */
export const revalidate = 3600

/** Public pages that exist without any data behind them. */
const STATIC_PATHS = [
  "",
  "/courses",
  "/pricing",
  "/support",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
  "/verify",
]

interface IPublishedCourse {
  slug: string
  updatedAt: string
}

/**
 * Published course slugs. Anonymous on purpose (see fetchPublic): the sitemap
 * must list only what anyone can see. If the API is unreachable the sitemap
 * still serves the static pages rather than failing.
 */
async function publishedCourses(): Promise<IPublishedCourse[]> {
  return (
    (await fetchPublic<IPublishedCourse[]>("/course/published", revalidate)) ??
    []
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const courses = await publishedCourses()

  return [
    ...STATIC_PATHS.map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.5,
    })),
    ...courses.map((course) => ({
      url: `${base}/courses/${encodeURIComponent(course.slug)}`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ]
}
