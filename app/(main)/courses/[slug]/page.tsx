"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter, notFound } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  GraduationCap,
  Lock,
  School,
  Sparkles,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Skeleton } from "@/components/ui/skeleton"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { COLOR } from "@/utils/constants/landing.constant"
import { useLanguageStore } from "@/stores/languages/language-store"
import {
  getCourseBySlug,
  getCourseStructure,
  getGradeLevels,
} from "@/lib/api/catalog"
import {
  checkEnrollment,
  enrollInCourse,
  unenrollFromCourse,
} from "@/lib/api/enrollment"
import { getMyLessonProgress } from "@/lib/api/lesson-progress"
import { ApiError } from "@/lib/api/client"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import type {
  IApiCourse,
  IApiGradeLevel,
  IApiModuleWithLessons,
} from "@/utils/interfaces/catalog/api.interface"
import type { IApiEnrollment } from "@/utils/interfaces/enrollment/api.interface"

/* ── Colour mappings ─────────────────────────────────────────────────── */

const LEVEL_BADGE: Record<"beginner" | "intermediate" | "advanced", string> = {
  beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  intermediate:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  advanced:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
}

const GRADE_BADGE =
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300"
const ALL_GRADE_BADGE =
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"

/* ── Page: fully API-backed; an unknown slug is a 404 ────────────────── */

export default function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>()

  const [status, setStatus] = useState<"loading" | "found" | "not-found">(
    "loading"
  )
  const [apiCourse, setApiCourse] = useState<IApiCourse | null>(null)
  const [structure, setStructure] = useState<IApiModuleWithLessons[]>([])
  const [gradeLevels, setGradeLevels] = useState<IApiGradeLevel[]>([])

  useEffect(() => {
    let cancelled = false
    // A route slug change starts a new external API request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStatus("loading")

    getCourseBySlug(slug)
      .then(async (course) => {
        const [courseStructure, courseGradeLevels] = await Promise.all([
          getCourseStructure(course.id),
          course.programType === "k12" ? getGradeLevels() : Promise.resolve([]),
        ])
        if (cancelled) return
        setApiCourse(course)
        setStructure(courseStructure)
        setGradeLevels(courseGradeLevels)
        setStatus("found")
      })
      .catch(() => {
        if (!cancelled) setStatus("not-found")
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === "loading") {
    return (
      <AppShell>
        <div className="mx-auto max-w-5xl space-y-8">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </AppShell>
    )
  }

  if (status === "found" && apiCourse) {
    return (
      <ApiCourseDetail
        course={apiCourse}
        structure={structure}
        gradeLevels={gradeLevels}
      />
    )
  }

  notFound()
}

/* ── Real (API-backed) course detail — simplified, no fabricated stats ─ */

function ApiCourseDetail({
  course,
  structure,
  gradeLevels,
}: {
  course: IApiCourse
  structure: IApiModuleWithLessons[]
  gradeLevels: IApiGradeLevel[]
}) {
  const t = useTranslations("courseDetail")
  const router = useRouter()
  const { language } = useLanguageStore()
  const nameOf = (en: string, km?: string) =>
    language === "km" && km ? km : en

  const [enrollment, setEnrollment] = useState<IApiEnrollment | null>(null)
  const [enrollPending, setEnrollPending] = useState(false)
  const [enrollError, setEnrollError] = useState<string | null>(null)
  const [justEnrolled, setJustEnrolled] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())

  /* A guest (or expired session) simply sees the enroll CTA — the click
     redirects to login, so the check failing is not an error state. */
  useEffect(() => {
    let cancelled = false
    Promise.all([
      checkEnrollment(course.id).catch(() => ({ enrollment: null })),
      getMyLessonProgress().catch(() => []),
    ]).then(([res, progress]) => {
      if (cancelled) return
      setEnrollment(res.enrollment)
      setCompletedIds(
        new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
      )
    })
    return () => {
      cancelled = true
    }
  }, [course.id])

  const enroll = async () => {
    setEnrollPending(true)
    setEnrollError(null)
    try {
      const created = await enrollInCourse(course.id)
      setEnrollment(created)
      setJustEnrolled(true)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/login?next=/courses/${course.slug}`)
        return
      }
      if (
        course.requiresSubscription &&
        err instanceof ApiError &&
        err.status === 403
      ) {
        router.push(`/pricing?course=${encodeURIComponent(course.slug)}`)
        return
      }
      setEnrollError(t("enrollError"))
    } finally {
      setEnrollPending(false)
    }
  }

  const unenroll = async () => {
    setEnrollError(null)
    try {
      await unenrollFromCourse(course.id)
      setEnrollment(null)
      setJustEnrolled(false)
    } catch {
      setEnrollError(t("enrollError"))
    }
  }

  const [openModule, setOpenModule] = useState(0)

  const totalLessons = structure.reduce((sum, m) => sum + m.lessons.length, 0)
  const gradeLevel = gradeLevels.find((g) => g.id === course.gradeLevelId)
  const colors = COLOR.violet
  const premiumCourse = Boolean(
    course.requiredEntitlement || course.requiresSubscription
  )
  const courseLocked = structure.some((module) =>
    module.lessons.some((lesson) => lesson.locked)
  )

  const placement =
    course.programType === "k12"
      ? {
          icon: School,
          statLabel: t("statGrade"),
          value: gradeLevel
            ? t("gradeLabel", { grade: gradeLevel.grade })
            : t("allGrades"),
          badge: GRADE_BADGE,
        }
      : {
          icon: GraduationCap,
          statLabel: t("statLevel"),
          value: course.difficulty ? t(`levels.${course.difficulty}`) : "",
          badge: course.difficulty
            ? LEVEL_BADGE[course.difficulty]
            : ALL_GRADE_BADGE,
        }

  const stats = [
    {
      icon: placement.icon,
      label: placement.statLabel,
      value: placement.value,
    },
    {
      icon: BookOpen,
      label: t("statLessons"),
      value: t("lessonsCount", { count: totalLessons }),
    },
    ...(course.estimatedHours
      ? [
          {
            icon: Clock,
            label: t("statDuration"),
            value: t("hoursCount", { count: course.estimatedHours }),
          },
        ]
      : []),
  ]

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8">
        <AnimateIn animation="fade-up" delay={0.05}>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
        </AnimateIn>

        {/* Hero */}
        <AnimateIn animation="fade-up" delay={0.1}>
          <div
            className={`card-surface rounded-2xl border p-6 sm:p-8 ${colors.border}`}
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div
                className={`size-16 rounded-2xl ${colors.bg} flex shrink-0 items-center justify-center`}
              >
                <BookOpen className={`size-8 ${colors.icon}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${placement.badge}`}
                  >
                    {placement.value}
                  </span>
                </div>
                <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground sm:text-3xl">
                  {nameOf(course.title, course.titleKm)}
                </TypographyH2>
                {course.description && (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {nameOf(course.description, course.descriptionKm)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-6 sm:grid-cols-3">
              {stats.map(({ icon: StatIcon, label, value }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className={`size-9 rounded-xl ${colors.bg} flex shrink-0 items-center justify-center`}
                  >
                    <StatIcon className={`size-4 ${colors.icon}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      {label}
                    </div>
                    <div className="truncate text-sm font-semibold text-foreground">
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <AnimateIn animation="fade-up" delay={0.2}>
              <div>
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <TypographyH3 className="text-lg font-bold text-foreground">
                    {t("syllabusTitle")}
                  </TypographyH3>
                  <TypographyMuted className="text-xs">
                    {t("modulesCount", { count: structure.length })} ·{" "}
                    {t("lessonsCount", { count: totalLessons })}
                  </TypographyMuted>
                </div>

                <div className="space-y-3">
                  {structure.map((mod, mi) => {
                    const open = openModule === mi
                    return (
                      <div
                        key={mod.id}
                        className="card-surface overflow-hidden rounded-2xl border border-border"
                      >
                        <button
                          onClick={() => setOpenModule(open ? -1 : mi)}
                          className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/40 sm:px-5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-foreground">
                              {mod.title}
                            </div>
                            {mod.description && (
                              <div className="text-[11px] text-muted-foreground">
                                {mod.description}
                              </div>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {enrollment
                              ? `${mod.lessons.filter((l) => completedIds.has(l.id)).length}/${mod.lessons.length}`
                              : mod.lessons.length}
                          </span>
                          <ChevronDown
                            className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
                          />
                        </button>

                        {open && (
                          <div className="border-t border-border">
                            {mod.lessons.map((lesson) => (
                              <Link
                                key={lesson.id}
                                href={
                                  lesson.locked
                                    ? `/pricing?course=${encodeURIComponent(course.slug)}`
                                    : `/learn/${course.slug}/${lesson.slug}`
                                }
                              >
                                <div className="flex cursor-pointer items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-5">
                                  {lesson.locked ? (
                                    <Lock className="size-4 shrink-0 text-violet-500" />
                                  ) : (
                                    <BookOpen
                                      className={`size-4 shrink-0 ${colors.icon}`}
                                    />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm leading-tight text-foreground">
                                      {lesson.title}
                                    </div>
                                  </div>
                                  {lesson.estimatedMinutes && (
                                    <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                                      <Clock className="size-3" />
                                      {lesson.estimatedMinutes} min
                                    </span>
                                  )}
                                  {lesson.locked ? (
                                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                                      {t("locked")}
                                    </span>
                                  ) : completedIds.has(lesson.id) ? (
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                                  ) : (
                                    <Circle className="size-4 shrink-0 text-muted-foreground/50" />
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </AnimateIn>
          </div>

          <AnimateIn
            animation="fade-left"
            delay={0.2}
            className="lg:sticky lg:top-6"
          >
            <div
              className={`card-surface rounded-2xl border p-5 ${colors.border} space-y-5`}
            >
              <div className="flex items-baseline gap-2">
                <span className="gradient-text text-2xl font-bold">
                  {premiumCourse
                    ? courseLocked
                      ? t("premium")
                      : t("includedInPlan")
                    : t("free")}
                </span>
                {!premiumCourse && (
                  <span className="text-xs text-muted-foreground">
                    {t("freeNote")}
                  </span>
                )}
              </div>

              {/* Progress (enrolled only) */}
              {enrollment && !justEnrolled && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {t("yourProgress")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {enrollment.progressPercent}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="gradient-bg-primary h-full rounded-full transition-all"
                      style={{ width: `${enrollment.progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    {t("completedOf", {
                      done: structure
                        .flatMap((m) => m.lessons)
                        .filter((l) => completedIds.has(l.id)).length,
                      total: totalLessons,
                    })}
                  </p>
                </div>
              )}

              {courseLocked ? (
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-4 text-center dark:border-violet-500/25 dark:bg-violet-500/10">
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
                    <Lock className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-foreground">
                    {t("unlockTitle")}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {t("unlockDesc")}
                  </p>
                  <Link
                    href={`/pricing?course=${encodeURIComponent(course.slug)}`}
                    className="gradient-bg-primary mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    <Sparkles className="size-4" />
                    {t("upgradeToUnlock")}
                  </Link>
                </div>
              ) : enrollment ? (
                <>
                  <Link href={`/learn/${course.slug}`} className="block">
                    <button className="gradient-bg-primary btn-shine flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90">
                      {justEnrolled
                        ? t("startLearning")
                        : t("continueLearning")}
                      <ArrowRight className="size-4" />
                    </button>
                  </Link>
                  <ConfirmDialog
                    title={t("unenrollTitle")}
                    description={t("unenrollDesc")}
                    variant="danger"
                    onConfirm={unenroll}
                  >
                    <button className="w-full text-center text-xs text-muted-foreground transition-colors hover:text-destructive">
                      {t("unenroll")}
                    </button>
                  </ConfirmDialog>
                </>
              ) : (
                <button
                  onClick={enroll}
                  disabled={enrollPending}
                  className="gradient-bg-primary btn-shine flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Sparkles className="size-4" />
                  {enrollPending ? t("enrolling") : t("enrollNow")}
                </button>
              )}

              {enrollError && (
                <p className="text-center text-xs text-destructive">
                  {enrollError}
                </p>
              )}
            </div>
          </AnimateIn>
        </div>
      </div>
    </AppShell>
  )
}
