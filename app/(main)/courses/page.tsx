"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowRight, Atom, Binary, BookOpen, Brain, Calculator, CheckCircle2,
  Cloud, Code2, Cpu, FlaskConical, Gamepad2, Globe, GraduationCap,
  Landmark, Languages, Leaf, Lock, RotateCcw, School, ShieldCheck,
  Smartphone, Sparkles, Terminal, TriangleAlert,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { COLOR } from "@/utils/constants/landing.constant"
import type { TColorKey } from "@/utils/constants/landing.constant"
import { useLanguageStore } from "@/stores/languages/language-store"
import {
  getSubjects, getGradeLevels, getProgrammingCategories, getCourses,
  getFaculties, getCourseLessonCount,
} from "@/lib/api/catalog"
import { getMyEnrollments } from "@/lib/api/enrollment"
import type { IApiEnrollment } from "@/utils/interfaces/enrollment/api.interface"
import type {
  IApiSubject, IApiGradeLevel, IApiProgrammingCategory, IApiCourse, IApiFaculty,
} from "@/utils/interfaces/catalog/api.interface"
import type { TCatalogTrack } from "@/utils/interfaces/catalog"

/* ── Icon mapping — keys match the `icon` slug seeded on the API ──────── */

const ICON_MAP: Record<string, React.ElementType> = {
  calculator: Calculator, "book-open": BookOpen, languages: Languages,
  atom: Atom, "flask-conical": FlaskConical, leaf: Leaf, landmark: Landmark,
  globe: Globe, code: Code2, terminal: Terminal, smartphone: Smartphone,
  brain: Brain, binary: Binary, "gamepad-2": Gamepad2, cloud: Cloud,
  "shield-check": ShieldCheck, cpu: Cpu,
}

/** Deterministic visual variety for items the API doesn't assign a color to. */
const COLOR_KEYS: TColorKey[] = ["violet", "cyan", "emerald", "amber", "indigo"]
const colorFor = (i: number) => COLOR_KEYS[i % COLOR_KEYS.length]

/* ── Difficulty → colour mappings (programming track) ─────────────────── */

const LEVEL_COLORS: Record<string, {
  badge: string
  bar: string
  ring: string
  icon: string
}> = {
  beginner: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    bar:   "from-emerald-500 to-emerald-400",
    ring:  "border-emerald-200 dark:border-emerald-500/25",
    icon:  "bg-emerald-100 dark:bg-emerald-500/15",
  },
  intermediate: {
    badge: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
    bar:   "from-cyan-500 to-cyan-400",
    ring:  "border-cyan-200 dark:border-cyan-500/25",
    icon:  "bg-cyan-100 dark:bg-cyan-500/15",
  },
  advanced: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    bar:   "from-amber-500 to-amber-400",
    ring:  "border-amber-200 dark:border-amber-500/25",
    icon:  "bg-amber-100 dark:bg-amber-500/15",
  },
}

const TRACKS: { key: TCatalogTrack; icon: React.ElementType }[] = [
  { key: "k12",         icon: School        },
  { key: "programming", icon: Code2         },
  { key: "university",  icon: GraduationCap },
]

const FILTERS = ["all", "beginner", "intermediate", "advanced"] as const
type TFilter = (typeof FILTERS)[number]

/* ── Catalog data, fetched once on mount ───────────────────────────────── */

interface ICatalog {
  subjects: IApiSubject[]
  gradeLevels: IApiGradeLevel[]
  categories: IApiProgrammingCategory[]
  courses: IApiCourse[]
  faculties: IApiFaculty[]
  lessonCounts: Record<string, number>
  enrollments: IApiEnrollment[]
}

export default function CoursesPage() {
  const t = useTranslations("courses")
  const { language } = useLanguageStore()

  const [track,    setTrack]    = useState<TCatalogTrack>("k12")
  const [grade,    setGrade]    = useState(12)
  const [filter,   setFilter]   = useState<TFilter>("all")
  const [category, setCategory] = useState<string>("all")

  const [catalog, setCatalog] = useState<ICatalog | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [subjects, gradeLevels, categories, courses, faculties, enrollments] = await Promise.all([
        getSubjects(), getGradeLevels(), getProgrammingCategories(), getCourses(), getFaculties(),
        /* Guests can browse the catalog — a 401 here just means "not enrolled in anything". */
        getMyEnrollments().catch(() => [] as IApiEnrollment[]),
      ])

      const counts = await Promise.all(
        courses.map((c) => getCourseLessonCount(c.id).then((n) => [c.id, n] as const))
      )

      setCatalog({
        subjects, gradeLevels, categories, courses, faculties, enrollments,
        lessonCounts: Object.fromEntries(counts),
      })
    } catch {
      setError(t("loadError"))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    load()
  }, [load])

  /* Build a lookup: course id → the student's enrollment (empty for guests) */
  const enrolledMap: Record<string, IApiEnrollment> = Object.fromEntries(
    (catalog?.enrollments ?? []).map((e) => [e.courseId, e])
  )

  const trackLabels: Record<TCatalogTrack, string> = {
    k12:         t("trackK12"),
    programming: t("trackProgramming"),
    university:  t("trackUniversity"),
  }

  const filterKeys: Record<TFilter, string> = {
    all:          t("filterAll"),
    beginner:     t("filterBeginner"),
    intermediate: t("filterIntermediate"),
    advanced:     t("filterAdvanced"),
  }

  const nameOf = (en: string, km?: string) => (language === "km" && km ? km : en)

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page header */}
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <TypographyH2 className="text-2xl font-bold text-foreground border-0 pb-0 mb-1">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {/* Track switcher */}
        <AnimateIn animation="fade-up" delay={0.1}>
          <div className="flex items-center gap-2 flex-wrap">
            {TRACKS.map(({ key, icon: TrackIcon }) => (
              <Button
                key={key}
                onClick={() => setTrack(key)}
                variant={track === key ? "default" : "outline"}
                className={`h-auto px-4 py-2.5 ${
                  track === key
                    ? "shadow-md"
                    : "bg-card hover:border-violet-300 dark:hover:border-violet-500/40"
                }`}
              >
                <TrackIcon className="size-4" />
                {trackLabels[key]}
              </Button>
            ))}
          </div>
        </AnimateIn>

        {loading && <CatalogSkeleton />}

        {!loading && error && (
          <Card className="rounded-2xl border-dashed p-10 text-center">
            <div className="size-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
              <TriangleAlert className="size-5 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground text-base mb-1">{error}</h3>
            <Button variant="outline" size="sm" className="mt-4" onClick={load}>
              <RotateCcw className="size-3.5" />
              {t("retry")}
            </Button>
          </Card>
        )}

        {!loading && !error && catalog && (
          <>
            {/* ── K-12 track ── */}
            {track === "k12" && (
              <div className="space-y-6">

                {/* Grade picker */}
                <AnimateIn animation="fade-up" delay={0.15}>
                  <div>
                    <TypographyMuted className="text-xs mb-2.5">{t("k12Subtitle")}</TypographyMuted>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {catalog.gradeLevels.map(({ grade: g }) => (
                        <Button
                          key={g}
                          onClick={() => setGrade(g)}
                          variant={grade === g ? "default" : "outline"}
                          size="icon"
                          className={`size-10 ${
                            grade === g
                              ? "shadow-md"
                              : "bg-card hover:border-violet-300 dark:hover:border-violet-500/40"
                          }`}
                          aria-label={t("gradeLabel", { n: g })}
                        >
                          {g}
                        </Button>
                      ))}
                    </div>
                  </div>
                </AnimateIn>

                {/* BacII banner on Grade 12 */}
                {grade === 12 && (
                  <Card className="rounded-2xl px-5 py-3.5 border-violet-200 dark:border-violet-500/25 flex-row items-center gap-3">
                    <div className="size-9 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center shrink-0">
                      <Sparkles className="size-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">{t("bacIIBanner")}</p>
                  </Card>
                )}

                {/* Subject grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {(() => {
                    const gradeLevelId = catalog.gradeLevels.find((g) => g.grade === grade)?.id
                    // One card per subject — but a subject may offer several courses at
                    // the same grade (e.g. Grade 12 maths splits into មូលដ្ឋាន / កម្រិតខ្ពស់),
                    // so those fan out into one card per course variant.
                    return catalog.subjects.flatMap((subject, i) => {
                      const subjectCourses = catalog.courses.filter(
                        (c) => c.programType === "k12" && c.subjectId === subject.id && c.gradeLevelId === gradeLevelId,
                      )
                      if (subjectCourses.length <= 1) return [{ subject, i, course: subjectCourses[0], variant: "" }]
                      return subjectCourses.map((course) => {
                        const tt = course.title ?? ""
                        const variant = tt.includes("មូលដ្ឋាន")
                          ? "មូលដ្ឋាន"
                          : tt.includes("កម្រិតខ្ពស់")
                            ? "កម្រិតខ្ពស់"
                            : tt
                        return { subject, i, course, variant }
                      })
                    })
                  })().map(({ subject, i, course, variant }) => {
                    const colors = COLOR[colorFor(i)]
                    const Icon   = ICON_MAP[subject.icon ?? ""] ?? BookOpen
                    const available = Boolean(course)
                    const lessonCount = course ? (catalog.lessonCounts[course.id] ?? 0) : 0
                    const enrolled = course ? enrolledMap[course.id] : undefined

                    const card = (
                      <Card className={`rounded-2xl p-5 flex flex-col gap-4 h-full transition-all ${
                        available
                          ? `${colors.border} hover:shadow-lg group cursor-pointer`
                          : "border-dashed"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className={`size-12 rounded-2xl ${colors.bg} flex items-center justify-center transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6`}>
                            <Icon className={`size-6 ${colors.icon}`} />
                          </div>
                          {available ? (
                            <Badge className={colors.badge}>{t("gradeLabel", { n: grade })}</Badge>
                          ) : (
                            <Badge variant="secondary">{t("comingSoon")}</Badge>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold text-base leading-tight ${available ? "text-foreground" : "text-muted-foreground"}`}>
                            {nameOf(subject.name, subject.nameKm)}
                            {variant && <span className="text-violet-600 dark:text-violet-400"> · {variant}</span>}
                          </h3>
                          {subject.nameKm && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{subject.nameKm}</p>
                          )}
                        </div>
                        {enrolled && (
                          <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="size-3" />
                                {t("enrolled")}
                              </span>
                              <span className="font-medium text-foreground">{enrolled.progressPercent}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full gradient-bg-primary transition-all"
                                style={{ width: `${enrolled.progressPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto text-xs text-muted-foreground">
                          {available && (
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="size-3.5" />
                              {t("lessons", { count: lessonCount })}
                            </span>
                          )}
                          {available && (
                            <span className="ml-auto flex items-center gap-1 font-semibold text-violet-600 dark:text-violet-400">
                              {enrolled ? t("continueCourse") : t("enroll")}
                              <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                          )}
                        </div>
                      </Card>
                    )

                    return available ? (
                      <Link key={`${subject.id}:${course!.id}`} href={`/courses/${course!.slug}`}>{card}</Link>
                    ) : (
                      <div key={`${subject.id}:none`}>{card}</div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Programming & Skills track ── */}
            {track === "programming" && (() => {
              const programmingCourses = catalog.courses.filter((c) => c.programType === "programming")
              const inCategory = category === "all"
                ? programmingCourses
                : programmingCourses.filter((c) => c.categoryId === category)
              const visible = filter === "all"
                ? inCategory
                : inCategory.filter((c) => c.difficulty === filter)
              const countIn = (categoryId: string) =>
                programmingCourses.filter((c) => c.categoryId === categoryId).length

              return (
                <div className="space-y-6">

                  {/* Category picker */}
                  <AnimateIn animation="fade-up" delay={0.15}>
                    <div>
                      <TypographyMuted className="text-xs mb-2.5">{t("categorySubtitle")}</TypographyMuted>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          onClick={() => setCategory("all")}
                          variant={category === "all" ? "default" : "outline"}
                          className={`h-auto px-3.5 py-2 font-medium ${
                            category === "all"
                              ? "shadow-md"
                              : "bg-card hover:border-violet-300 dark:hover:border-violet-500/40"
                          }`}
                        >
                          {t("categoryAll")}
                          <span className={`text-xs ${category === "all" ? "text-white/80" : "text-muted-foreground"}`}>
                            ({programmingCourses.length})
                          </span>
                        </Button>

                        {catalog.categories.map((cat) => {
                          const Icon     = ICON_MAP[cat.icon ?? ""] ?? Code2
                          const count    = countIn(cat.id)
                          const selected = category === cat.id
                          return (
                            <Button
                              key={cat.id}
                              onClick={() => setCategory(cat.id)}
                              variant={selected ? "default" : "outline"}
                              className={`h-auto px-3.5 py-2 font-medium ${
                                selected
                                  ? "shadow-md"
                                  : count === 0
                                    ? "bg-card border-dashed text-muted-foreground/50 hover:text-muted-foreground"
                                    : "bg-card hover:border-violet-300 dark:hover:border-violet-500/40"
                              }`}
                            >
                              <Icon className="size-3.5 shrink-0" />
                              {nameOf(cat.name, cat.nameKm)}
                              <span className={`text-xs ${selected ? "text-white/80" : "text-muted-foreground"}`}>
                                ({count})
                              </span>
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  </AnimateIn>

                  {/* Level filter — counts reflect the selected category */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {FILTERS.map((f) => (
                      <Button
                        key={f}
                        onClick={() => setFilter(f)}
                        variant={filter === f ? "default" : "outline"}
                        className={`h-auto px-4 py-2 font-medium ${
                          filter === f
                            ? "shadow-md"
                            : "bg-card hover:border-violet-300 dark:hover:border-violet-500/40"
                        }`}
                      >
                        {filterKeys[f]}
                        <span className={`text-xs ${filter === f ? "text-white/80" : "text-muted-foreground"}`}>
                          ({f === "all" ? inCategory.length : inCategory.filter((c) => c.difficulty === f).length})
                        </span>
                      </Button>
                    ))}
                  </div>

                  {/* Empty state — category (or category + level) with nothing in it yet */}
                  {visible.length === 0 && (
                    <Card className="rounded-2xl border-dashed p-10 text-center">
                      <div className="size-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <Lock className="size-5 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground text-base mb-1">{t("noCoursesTitle")}</h3>
                      <TypographyMuted className="text-sm">{t("noCoursesDesc")}</TypographyMuted>
                    </Card>
                  )}

                  {/* Course grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {visible.map((course, i) => {
                      const enrolled = enrolledMap[course.id]
                      const colors   = LEVEL_COLORS[course.difficulty ?? "beginner"]
                      const cat      = catalog.categories.find((c) => c.id === course.categoryId)
                      const Icon     = ICON_MAP[cat?.icon ?? ""] ?? Code2
                      const lessonCount = catalog.lessonCounts[course.id] ?? 0

                      return (
                        <Card key={course.id} className={`rounded-2xl p-5 flex flex-col gap-4 hover:shadow-lg transition-all group ${colors.ring}`}>

                          {/* Top row: icon + level badge */}
                          <div className="flex items-start justify-between">
                            <div className={`size-14 rounded-2xl ${colors.icon} flex items-center justify-center transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6`}>
                              <Icon className={`size-7 ${COLOR[colorFor(i)].icon}`} />
                            </div>
                            <Badge className={colors.badge}>{filterKeys[(course.difficulty ?? "beginner") as TFilter]}</Badge>
                          </div>

                          {/* Title */}
                          <div>
                            <h3 className="font-semibold text-foreground text-base leading-tight">
                              {nameOf(course.title, course.titleKm)}
                            </h3>
                            {course.titleKm && (
                              <p className="text-[11px] text-muted-foreground leading-relaxed">{course.titleKm}</p>
                            )}
                          </div>

                          {/* Description */}
                          {course.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                              {course.description}
                            </p>
                          )}

                          {/* Meta: lessons */}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="size-3.5" />
                              {t("lessons", { count: lessonCount })}
                            </span>
                          </div>

                          {/* Progress (if enrolled) */}
                          {enrolled && (
                            <div>
                              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 className="size-3" />
                                  {t("enrolled")}
                                </span>
                                <span className="font-medium text-foreground">{enrolled.progressPercent}%</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${colors.bar} transition-all`}
                                  style={{ width: `${enrolled.progressPercent}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* CTA */}
                          <Button
                            asChild
                            variant={enrolled ? "default" : "outline"}
                            className={`mt-auto w-full ${
                              enrolled ? "" : "hover:border-violet-300 dark:hover:border-violet-500/40 hover:bg-muted/60"
                            }`}
                          >
                            <Link href={`/courses/${course.slug}`}>
                              {enrolled ? t("continueCourse") : t("enroll")}
                              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          </Button>
                        </Card>
                      )
                    })}

                    {/* Locked placeholder card — only meaningful when browsing everything */}
                    {category === "all" && (
                      <Card className="rounded-2xl p-5 flex flex-col gap-4 border-dashed opacity-60 select-none">
                        <div className="flex items-start justify-between">
                          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center">
                            <Lock className="size-6 text-muted-foreground" />
                          </div>
                          <Lock className="size-4 text-muted-foreground mt-1" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-muted-foreground text-base">{t("moreSoonTitle")}</h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{t("moreSoonSubtitle")}</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                          {t("moreSoonDesc")}
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* ── University track (coming soon) ── */}
            {track === "university" && (
              <div className="space-y-6">
                <Card className="rounded-2xl p-6 sm:p-8 text-center">
                  <div className="size-14 rounded-2xl gradient-bg-primary flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="size-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-1.5">{t("uniTitle")}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                    {t("uniDesc")}
                  </p>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {catalog.faculties.map((faculty) => {
                    const Icon = ICON_MAP[faculty.icon ?? ""] ?? GraduationCap
                    return (
                      <Card
                        key={faculty.id}
                        className="rounded-2xl p-4 border-dashed flex flex-col items-center gap-2.5 text-center select-none"
                      >
                        <div className="size-11 rounded-xl bg-muted flex items-center justify-center">
                          <Icon className="size-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-muted-foreground">
                            {nameOf(faculty.name, faculty.nameKm)}
                          </div>
                          {faculty.nameKm && (
                            <div className="text-[11px] text-muted-foreground mt-0.5">{faculty.nameKm}</div>
                          )}
                        </div>
                        <Badge variant="secondary">{t("comingSoon")}</Badge>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AppShell>
  )
}

/* ── Loading skeleton ───────────────────────────────────────────────────── */

function CatalogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1.5 flex-wrap">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="size-10 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
