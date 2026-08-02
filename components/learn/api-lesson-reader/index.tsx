"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Lock,
  Sparkles,
  X,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { ThemeToggle } from "@/components/utils/themes/theme-toggle"
import { LanguageSwitcher } from "@/components/utils/language-switcher"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { useLanguageStore } from "@/stores/languages/language-store"
import { useProfileStore } from "@/stores/profiles/profile-store"
import { getCourseBySlug, getCourseStructure } from "@/lib/api/catalog"
import { checkEnrollment } from "@/lib/api/enrollment"
import {
  getMyLessonProgress,
  markLessonComplete,
} from "@/lib/api/lesson-progress"
import { QuizRunner } from "@/components/learn/quiz-runner"
import { ChallengeRunner } from "@/components/learn/challenge-runner"
import { LessonContent } from "@/components/learn/lesson-content"
import type {
  IApiCourse,
  IApiLesson,
  IApiModuleWithLessons,
} from "@/utils/interfaces/catalog/api.interface"

interface ApiLessonReaderProps {
  /** Course slug — resolved against the real API, not the mock catalog. */
  slug: string
  /** Lesson slug to open on mount (defaults to the course's first lesson). */
  initialLessonSlug?: string
}

export function ApiLessonReader({
  slug,
  initialLessonSlug,
}: ApiLessonReaderProps) {
  const t = useTranslations("learn")
  const { language } = useLanguageStore()
  const nameOf = (en: string, km?: string) =>
    language === "km" && km ? km : en

  const [course, setCourse] = useState<IApiCourse | null>(null)
  const [modules, setModules] = useState<IApiModuleWithLessons[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openSections, setOpenSections] = useState<number[]>([])
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)

  /* Guests and the un-enrolled read lessons fine — they just can't track. */
  const [enrolled, setEnrolled] = useState(false)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [marking, setMarking] = useState(false)
  const [xpFlash, setXpFlash] = useState(0)

  useEffect(() => {
    let cancelled = false
    // The slug is an external route input, so a change starts a fresh request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    getCourseBySlug(slug)
      .then(async (c) => {
        const [structure, enrollmentCheck, progress] = await Promise.all([
          getCourseStructure(c.id),
          checkEnrollment(c.id).catch(() => ({ enrolled: false })),
          getMyLessonProgress().catch(() => []),
        ])
        if (cancelled) return
        setCourse(c)
        setModules(structure)
        setEnrolled(enrollmentCheck.enrolled)
        setCompletedIds(
          new Set(progress.filter((p) => p.completed).map((p) => p.lessonId))
        )
        setOpenSections(structure.map((_, i) => i))
        const lessons = structure.flatMap((m) => m.lessons)
        const initial = initialLessonSlug
          ? lessons.find((l) => l.slug === initialLessonSlug)
          : lessons[0]
        setCurrentLessonId((initial ?? lessons[0])?.id ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  const completeLesson = async (lesson: IApiLesson) => {
    if (marking || completedIds.has(lesson.id)) return
    setMarking(true)
    try {
      const result = await markLessonComplete(lesson.id)
      setCompletedIds((prev) => new Set(prev).add(lesson.id))
      if (result.xpAwarded > 0) {
        setXpFlash(result.xpAwarded)
        const { xp, streak, setStats } = useProfileStore.getState()
        setStats({ xp: xp + result.xpAwarded, streak })
      }
    } catch {
      /* Session expired mid-read — the next navigation will bounce to login. */
    } finally {
      setMarking(false)
    }
  }

  const lessons = useMemo(() => modules.flatMap((m) => m.lessons), [modules])
  const currentLesson = lessons.find((l) => l.id === currentLessonId) ?? null

  const switchLesson = (lesson: IApiLesson) => {
    if (lesson.locked) return
    setCurrentLessonId(lesson.id)
    setSidebarOpen(false)
    setXpFlash(0)
    window.history.replaceState(null, "", `/learn/${slug}/${lesson.slug}`)
  }

  const toggleSection = (i: number) =>
    setOpenSections((prev) =>
      prev.includes(i) ? prev.filter((s) => s !== i) : [...prev, i]
    )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background p-6 text-center">
        <p className="text-sm text-muted-foreground">{t("notReadyDesc")}</p>
        <Link
          href={`/courses/${slug}`}
          className="text-xs text-violet-600 hover:underline dark:text-violet-400"
        >
          {t("backToCourse")}
        </Link>
      </div>
    )
  }

  const currentIdx = lessons.findIndex((l) => l.id === currentLesson.id)
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null
  const nextLesson =
    currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null

  /* Which chapter this lesson sits in, for the "Chapter X · Lesson Y of N" eyebrow. */
  const currentModuleIdx = modules.findIndex((m) =>
    m.lessons.some((l) => l.id === currentLesson.id)
  )
  const currentModule = modules[currentModuleIdx] ?? null

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── COURSE SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 xl:relative xl:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-4">
          <Link
            href={`/courses/${slug}`}
            className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            {t("backToCourse")}
          </Link>
          <div className="mx-0.5 h-4 w-px bg-border" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 truncate text-xs font-semibold text-foreground">
              <BookOpen className="size-3.5 shrink-0 text-violet-500" />
              {nameOf(course.title, course.titleKm)}
            </div>
          </div>
          <button
            className="p-1 text-muted-foreground hover:text-foreground xl:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Course progress — only meaningful once the student is enrolled */}
        {enrolled &&
          lessons.length > 0 &&
          (() => {
            const done = lessons.filter((l) => completedIds.has(l.id)).length
            const pct = Math.round((done / lessons.length) * 100)
            return (
              <div className="shrink-0 border-b border-border px-4 py-3">
                <div className="mb-1.5 flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">
                    {t("courseProgress")}
                  </span>
                  <span className="font-semibold text-foreground">
                    {t("lessonsOf", { done, total: lessons.length })}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="gradient-bg-primary h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })()}

        <div className="flex-1 overflow-y-auto py-2">
          {modules.map((mod, mi) => (
            <div key={mod.id} className="mb-1">
              <button
                onClick={() => toggleSection(mi)}
                className="group flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-muted/60"
              >
                <span className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">
                  {mod.title}
                </span>
                <ChevronDown
                  className={`size-3.5 text-muted-foreground transition-transform ${openSections.includes(mi) ? "rotate-180" : ""}`}
                />
              </button>

              {openSections.includes(mi) && (
                <div className="px-2 pb-1">
                  {mod.lessons.map((lesson) => {
                    const isActive = lesson.id === currentLesson.id
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => switchLesson(lesson)}
                        disabled={lesson.locked}
                        className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all ${
                          lesson.locked
                            ? "cursor-not-allowed opacity-60"
                            : isActive
                              ? "border border-violet-200 bg-violet-100 dark:border-violet-500/20 dark:bg-violet-500/15"
                              : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="shrink-0">
                          {lesson.locked ? (
                            <Lock className="size-4 text-muted-foreground" />
                          ) : completedIds.has(lesson.id) ? (
                            <CheckCircle2 className="size-4 text-emerald-500" />
                          ) : isActive ? (
                            <div className="flex size-4 items-center justify-center rounded-full border-2 border-violet-500 dark:border-violet-400">
                              <div className="size-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                            </div>
                          ) : (
                            <Circle className="size-4 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className={`truncate text-xs font-medium ${
                              isActive
                                ? "text-violet-700 dark:text-violet-300"
                                : "text-foreground/70"
                            }`}
                          >
                            {lesson.title}
                          </div>
                        </div>
                        {lesson.estimatedMinutes && (
                          <div className="shrink-0 text-[10px] text-muted-foreground">
                            {lesson.estimatedMinutes} min
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl">
          <button
            className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground xl:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <BookOpen className="size-4" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TypographyH4 className="truncate text-sm font-semibold text-foreground">
              {currentLesson.title}
            </TypographyH4>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle size="sm" />
            {prevLesson && (
              <button
                onClick={() => switchLesson(prevLesson)}
                className="hidden h-auto items-center rounded-xl bg-muted px-2.5 py-1.5 text-muted-foreground hover:bg-muted/70 sm:flex"
                title={prevLesson.title}
              >
                <ChevronLeft className="size-3.5" />
              </button>
            )}
            {nextLesson && (
              <button
                onClick={() => switchLesson(nextLesson)}
                className="hidden h-auto items-center gap-1 rounded-xl bg-muted px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 sm:flex"
              >
                {t("lesson")} <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-muted/10 p-6">
          <div className="mx-auto max-w-2xl">
            <AnimateIn animation="blur-up" delay={0.05}>
              {/* Orientation: which chapter, and where in the whole course. */}
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium">
                {currentModule && (
                  <>
                    <span className="text-violet-600 dark:text-violet-400">
                      {currentModule.title}
                    </span>
                    <span className="size-1 rounded-full bg-muted-foreground/40" />
                  </>
                )}
                <span className="text-muted-foreground">
                  {t("lessonPosition", {
                    n: currentIdx + 1,
                    total: lessons.length,
                  })}
                </span>
              </div>
              <TypographyH2 className="leading-khmer mb-8 border-0 pb-0 text-2xl font-bold text-foreground">
                {currentLesson.title}
              </TypographyH2>
            </AnimateIn>

            {currentLesson.locked ? (
              <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-8 text-center dark:border-violet-500/25 dark:bg-violet-500/10">
                <Lock className="mx-auto mb-3 size-8 text-violet-500" />
                <h3 className="text-base font-semibold text-foreground">
                  {t("subscriptionRequired")}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                  {t("subscriptionRequiredDesc")}
                </p>
                <Link
                  href={`/pricing?course=${encodeURIComponent(slug)}`}
                  className="gradient-bg-primary mt-5 inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                >
                  {t("viewCourseOptions")}
                </Link>
              </div>
            ) : currentLesson.content ? (
              <LessonContent content={currentLesson.content} />
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                {t("noTheory")}
              </div>
            )}

            {/* Practice quiz — /learn is auth-gated, so the student is signed
                in; the runner shows nothing when a lesson has no quiz. */}
            {!currentLesson.locked && (
              <QuizRunner lessonId={currentLesson.id} />
            )}

            {!currentLesson.locked && (
              <ChallengeRunner lessonId={currentLesson.id} />
            )}

            {/* Completion — enrolled students track progress; others get a nudge */}
            {!currentLesson.locked && (
              <div className="mt-6">
                {enrolled ? (
                  completedIds.has(currentLesson.id) ? (
                    <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-3.5 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <CheckCircle2 className="size-4" />
                      {t("completed")}
                      {xpFlash > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                          <Sparkles className="size-3.5" />
                          {t("xpEarned", { xp: xpFlash })}
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => completeLesson(currentLesson)}
                      disabled={marking}
                      className="gradient-bg-primary btn-shine flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle2 className="size-4" />
                      {t("markComplete")}
                    </button>
                  )
                ) : (
                  <Link
                    href={`/courses/${slug}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-violet-300 px-5 py-3.5 text-sm text-violet-600 transition-colors hover:bg-violet-50/60 dark:border-violet-500/40 dark:text-violet-400 dark:hover:bg-violet-500/10"
                  >
                    <Sparkles className="size-4" />
                    {t("enrollToTrack")}
                  </Link>
                )}
              </div>
            )}

            {nextLesson && (
              <AnimateIn animation="fade-up" delay={0.4}>
                <div className="mt-6">
                  <button
                    onClick={() => switchLesson(nextLesson)}
                    className="card-surface group flex w-full items-center justify-between rounded-2xl border border-border p-4 transition-all hover:border-violet-300 dark:hover:border-violet-500/40"
                  >
                    <div className="text-left">
                      <div className="mb-0.5 text-[10px] text-muted-foreground">
                        {t("nextLesson")}
                      </div>
                      <div className="text-sm font-semibold text-foreground">
                        {nextLesson.title}
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-violet-500" />
                  </button>
                </div>
              </AnimateIn>
            )}
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
