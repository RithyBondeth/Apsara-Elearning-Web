"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquareQuote, Star } from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Avatar } from "@/components/utils/avatar"
import { StarRating } from "@/components/course/course-ratings/star-rating"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { getFeaturedReviews } from "@/lib/api/rating"
import { useLanguageStore } from "@/stores/languages/language-store"
import { toKhmerNumerals } from "@/utils/functions/format"
import type { IApiFeaturedReviews } from "@/utils/interfaces/rating/api.interface"

/**
 * Below this many quotes (featured reviews + testimonials) the section stays hidden — one or two
 * quotes read as thin, and an empty band reads as broken.
 */
export const MIN_FEATURED_REVIEWS = 3

/**
 * Real learner reviews curated by an admin (/admin/reviews), plus consented
 * quotes from teachers and beta testers (/admin/testimonials). Nothing here is
 * hardcoded: with too few quotes the section does not render.
 */
export function LandingReviews() {
  const t = useTranslations("reviews")
  const { language } = useLanguageStore()
  const [data, setData] = useState<IApiFeaturedReviews | null>(null)

  useEffect(() => {
    let active = true
    getFeaturedReviews()
      .then((d) => active && setData(d))
      .catch(() => {
        // No reviews to show is the same as not showing the section.
      })
    return () => {
      active = false
    }
  }, [])

  const testimonials = data?.testimonials ?? []
  if (!data || data.items.length + testimonials.length < MIN_FEATURED_REVIEWS) return null

  // Khmer copy spells numbers in Khmer digits; "4.4" keeps its decimal point.
  const digits = (s: string) =>
    language === "km" ? s.replace(/\d/g, (d) => toKhmerNumerals(Number(d))) : s
  const localized = (en: string, km?: string | null) => (language === "km" && km ? km : en)

  return (
    <section id="reviews" className="landing-section-tinted scroll-mt-20 px-6 py-28">
      <div className="mx-auto max-w-7xl">
        <AnimateIn animation="fade-up" className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-300">
            <MessageSquareQuote className="size-3" />
            {t("badge")}
          </div>
          <TypographyH2 className="border-0 pb-0 text-4xl font-bold tracking-tight text-foreground">
            {t("headingPart1")} <span className="gradient-text-animated">{t("headingHighlight")}</span>
          </TypographyH2>
          {data.average !== null && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {t("summary", {
                average: digits(data.average.toFixed(1)),
                count: language === "km" ? digits(String(data.count)) : data.count,
              })}
            </p>
          )}
        </AnimateIn>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Educators first: their quotes speak to the curriculum as a whole. */}
          {testimonials.map((quote, i) => (
            <AnimateIn key={quote.id} animation="fade-up" delay={i * 0.08}>
              <figure className="card-surface flex h-full flex-col rounded-2xl border border-border p-6">
                <MessageSquareQuote className="size-5 text-violet-500" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                  “{localized(quote.quote, quote.quoteKm)}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Avatar preset={quote.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{quote.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {localized(quote.role, quote.roleKm)}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </AnimateIn>
          ))}
          {data.items.map((item, i) => (
            <AnimateIn key={item.id} animation="fade-up" delay={(testimonials.length + i) * 0.08}>
              <figure className="card-surface flex h-full flex-col rounded-2xl border border-border p-6">
                <StarRating value={item.rating} size="sm" />
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                  “{item.review}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <Avatar preset={item.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.displayName}</p>
                    <Link
                      href={`/courses/${item.courseSlug}`}
                      className="block truncate text-xs text-muted-foreground hover:text-foreground"
                    >
                      {t("onCourse", { course: localized(item.courseTitle, item.courseTitleKm) })}
                    </Link>
                  </div>
                </figcaption>
              </figure>
            </AnimateIn>
          ))}
        </div>
      </div>
    </section>
  )
}
