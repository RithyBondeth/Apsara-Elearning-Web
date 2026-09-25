"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight, Atom, BookOpen, Brain, Calculator, ChevronRight, Code2,
  FlaskConical, Globe, Landmark, Languages, Leaf, Terminal,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { Skeleton } from "@/components/ui/skeleton"
import { getCourses, getGradeLevels, getProgrammingCategories, getSubjects } from "@/lib/api/catalog"
import { useLanguageStore } from "@/stores/languages/language-store"
import { COLOR, type TColorKey } from "@/utils/constants/landing.constant"
import { lessonXp, pickFeaturedCourses } from "@/utils/functions/course"
import { toKhmerNumerals } from "@/utils/functions/format"
import type {
  IApiCourse, IApiGradeLevel, IApiProgrammingCategory, IApiSubject,
} from "@/utils/interfaces/catalog/api.interface"

/** Keys match the `icon` slug seeded on subjects and programming categories. */
const ICON_MAP: Record<string, React.ElementType> = {
  calculator: Calculator, "book-open": BookOpen, languages: Languages,
  atom: Atom, "flask-conical": FlaskConical, leaf: Leaf, landmark: Landmark,
  globe: Globe, code: Code2, terminal: Terminal, brain: Brain,
}

const COLOR_KEYS: TColorKey[] = ["violet", "cyan", "amber"]

const ANIMATIONS = ["fade-right", "zoom", "fade-left"] as const

interface IFeaturedData {
  courses: IApiCourse[]
  subjects: Map<string, IApiSubject>
  gradeLevels: Map<string, IApiGradeLevel>
  categories: Map<string, IApiProgrammingCategory>
}

const byId = <T extends { id: string }>(r: PromiseSettledResult<T[]>) =>
  new Map(r.status === "fulfilled" ? r.value.map((x) => [x.id, x] as const) : [])

export function LandingCourses() {
  const t = useTranslations("courses")
  const { language } = useLanguageStore()
  const [data, setData] = useState<IFeaturedData | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  const load = useCallback(() => {
    // Courses are required; the taxonomy only decorates cards, so a failure
    // there just drops icons and grade labels instead of the whole section.
    return Promise.all([
      getCourses(),
      Promise.allSettled([getSubjects(), getGradeLevels(), getProgrammingCategories()]),
    ])
      .then(([courses, [subjects, gradeLevels, categories]]) => {
        setData({
          courses: pickFeaturedCourses(courses),
          subjects: byId(subjects),
          gradeLevels: byId(gradeLevels),
          categories: byId(categories),
        })
        setStatus("ready")
      })
      .catch(() => setStatus("error"))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const retry = () => {
    setStatus("loading")
    load()
  }

  const nameOf = (en: string, km?: string) => (language === "km" && km ? km : en)
  const num = (n: number) => (language === "km" ? toKhmerNumerals(n) : n.toLocaleString("en-US"))

  const trackLabel = (course: IApiCourse) =>
    course.programType === "k12"
      ? t("trackK12")
      : course.programType === "university"
        ? t("trackUniversity")
        : t("trackProgramming")

  const levelLabel = (course: IApiCourse) => {
    const grade = course.gradeLevelId ? data?.gradeLevels.get(course.gradeLevelId) : undefined
    if (grade) return nameOf(grade.name, grade.nameKm)
    if (course.difficulty === "beginner") return t("filterBeginner")
    if (course.difficulty === "intermediate") return t("filterIntermediate")
    if (course.difficulty === "advanced") return t("filterAdvanced")
    return null
  }

  const iconFor = (course: IApiCourse) => {
    const slug =
      (course.subjectId && data?.subjects.get(course.subjectId)?.icon) ||
      (course.categoryId && data?.categories.get(course.categoryId)?.icon) ||
      ""
    return ICON_MAP[slug] ?? BookOpen
  }

  return (
    <section id="courses" className="landing-section-tinted scroll-mt-20 px-6 py-28">
      <div className="max-w-7xl mx-auto">
        <AnimateIn animation="fade-up" className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-500/15 border border-cyan-200 dark:border-cyan-500/25 text-xs text-cyan-700 dark:text-cyan-300 mb-4 font-medium">
                <BookOpen className="size-3" />
                {t("badge")}
              </div>
              <TypographyH2 className="text-4xl font-bold tracking-tight text-foreground border-0 pb-0">
                {t("headingPart1")}{" "}
                <span className="gradient-text-animated">{t("headingHighlight")}</span>
                {t("headingPart2") ? ` ${t("headingPart2")}` : ""}
              </TypographyH2>
            </div>
            <Link
              href="/courses"
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("viewAll")}
              <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </AnimateIn>

        {status === "loading" && (
          <div className="grid md:grid-cols-3 gap-6" aria-busy="true">
            {COLOR_KEYS.map((k) => (
              <Skeleton key={k} className="h-56 rounded-2xl" />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="card-surface flex flex-col items-center gap-3 rounded-2xl border border-border px-6 py-10 text-center">
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
            <button
              onClick={retry}
              className="rounded-xl border border-border bg-muted px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              {t("retry")}
            </button>
          </div>
        )}

        {status === "ready" && data && data.courses.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            {data.courses.map((course, i) => {
              const c = COLOR[COLOR_KEYS[i % COLOR_KEYS.length]]
              const Icon = iconFor(course)
              const level = levelLabel(course)
              const lessons = course.lessonCount ?? 0
              return (
                <AnimateIn key={course.id} animation={ANIMATIONS[i % ANIMATIONS.length]} delay={i * 0.12}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className={`landing-interactive-card group card-surface btn-shine flex h-full flex-col overflow-hidden rounded-2xl border ${c.border}`}
                  >
                    {/* Animated top gradient bar */}
                    <div className="animate-gradient h-1 w-full bg-gradient-to-r from-[#2383e2] via-[#7c5cff] to-[#22c9dd] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="p-6 flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`landing-card-icon flex size-14 items-center justify-center rounded-2xl ${c.bg}`}>
                          <Icon className={`size-7 ${c.icon}`} />
                        </div>
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${c.badge}`}>
                          {trackLabel(course)}
                        </span>
                      </div>
                      <TypographyH3 className="text-foreground text-lg mb-3">
                        {nameOf(course.title, course.titleKm)}
                      </TypographyH3>
                      <div className="flex flex-wrap items-center gap-3 mb-5">
                        {level && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {level}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {t("lessons", { count: num(lessons) })}
                        </span>
                        <span className={`text-xs font-semibold ${c.icon}`}>+{num(lessonXp(course))} XP</span>
                      </div>
                    </div>
                    <div className="px-6 pb-6">
                      <span className="landing-action group/btn flex w-full items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl bg-muted hover:bg-muted/80 border border-border text-foreground/70 hover:text-foreground">
                        {t("startCourse")}
                        <ArrowRight className="size-3.5 -ml-1 opacity-0 -translate-x-2 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />
                      </span>
                    </div>
                  </Link>
                </AnimateIn>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
