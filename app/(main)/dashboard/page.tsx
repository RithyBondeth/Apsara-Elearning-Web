"use client"

import Link from "next/link"
import {
  ChevronRight, BookOpen, Play, Clock, ArrowRight, CheckCircle2,
  Code2, Crown, Flame, School, Sparkles, Star, Zap,
  Medal, Trophy, Lock,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { CountUp } from "@/components/utils/animations/count-up"
import { GrowBar } from "@/components/utils/animations/grow-bar"
import { useProfile } from "@/hooks/utils/use-profile"
import { useProfileStats } from "@/hooks/utils/use-profile-stats"
import { useMyCourses } from "@/hooks/utils/use-my-courses"
import { useBadges } from "@/hooks/utils/use-badges"
import { useWeeklyActivity } from "@/hooks/utils/use-weekly-activity"
import { levelFromXp } from "@/utils/functions/format"
import { TypographyH1 } from "@/components/utils/typography/typography-h1"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"

/** Keys match the lucide slugs seeded on the badges' `icon` column. */
const BADGE_ICONS: Record<string, React.ElementType> = {
  trophy: Trophy, zap: Zap, star: Star, flame: Flame, medal: Medal, crown: Crown,
}

export default function DashboardPage() {
  const t = useTranslations("dashboard")
  const profile = useProfile()
  const stats = useProfileStats()
  const level = levelFromXp(stats.xp)

  /* Real enrollments + lesson progress; null while loading. */
  const myCourses = useMyCourses()
  const courses   = myCourses ?? []
  const resume    = courses[0]

  /* Real badge catalog + earned state; null while loading. */
  const badgeItems = useBadges()
  const badges     = badgeItems ?? []

  /* Real weekly lesson-completion strip from lesson-progress; null while loading. */
  const weekly         = useWeeklyActivity()
  const weeklyActivity = weekly?.days ?? []
  const weeklyDone     = weekly?.done ?? 0

  const totalLessonsDone = courses.reduce((s, c) => s + c.completedLessons, 0)
  const totalLessonsAll  = courses.reduce((s, c) => s + c.totalLessons, 0)
  const goalPct          = Math.min(100, Math.round((weeklyDone / profile.weeklyGoal) * 100))
  const maxDay           = Math.max(...weeklyActivity.map((d) => d.lessons), 1)
  const earnedBadges     = badges.filter((b) => b.earned).length
  const todayDone        = weeklyActivity.find((d) => d.isToday)?.lessons ?? 0

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Resume banner */}
        <AnimateIn animation="fade-up" delay={0.05}>
          <div className="relative rounded-2xl overflow-hidden p-6 card-surface border border-violet-200 dark:border-violet-500/20">
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="min-w-0">
                <TypographyMuted className="text-xs mb-1">{t("greeting")}</TypographyMuted>
                <TypographyH1 className="text-2xl font-bold text-foreground mb-3">
                  {t("welcomeBack")} <span className="gradient-text">{profile.name}</span>
                </TypographyH1>

                {/* What's next — the actual lesson, not a generic nudge */}
                {myCourses === null ? (
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                ) : resume ? (
                  <>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="uppercase tracking-wide text-[10px] font-semibold">{t("nextUp")}</span>
                      <span className="size-1 rounded-full bg-muted-foreground/40" />
                      <span className="truncate">{resume.course.title}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground truncate">
                      {resume.nextLesson?.title}
                    </div>
                    {resume.course.titleKm && (
                      <TypographyMuted className="text-xs">{resume.course.titleKm}</TypographyMuted>
                    )}
                  </>
                ) : (
                  <TypographyMuted className="text-sm">{t("noCoursesDesc")}</TypographyMuted>
                )}
              </div>

              <Button asChild size="lg" className="shrink-0">
                {resume ? (
                  <Link
                    href={
                      resume.nextLesson
                        ? `/learn/${resume.course.slug}/${resume.nextLesson.slug}`
                        : `/learn/${resume.course.slug}`
                    }
                  >
                    <Play className="size-4 fill-white" />
                    {t("continueLearning")}
                  </Link>
                ) : (
                  <Link href="/courses">
                    <Sparkles className="size-4" />
                    {t("browseCourses")}
                  </Link>
                )}
              </Button>
            </div>
          </div>
        </AnimateIn>

        {/* Progress stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimateIn animation="fade-up" delay={0.1}>
            <Card className="rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{t("lessonsCompleted")}</span>
                <div className="size-8 rounded-xl flex items-center justify-center bg-violet-100 dark:bg-violet-500/15">
                  <CheckCircle2 className="size-4 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                <CountUp to={totalLessonsDone} delay={0.4} duration={1.4} ease="power3.out" />
              </div>
              <TypographyMuted className="text-xs mt-1">
                {t("ofTotal", { total: totalLessonsAll })}
              </TypographyMuted>
            </Card>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={0.15}>
            <Card className="rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{t("coursesActive")}</span>
                <div className="size-8 rounded-xl flex items-center justify-center bg-cyan-100 dark:bg-cyan-500/15">
                  <BookOpen className="size-4 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                <CountUp to={courses.length} delay={0.5} duration={1.0} ease="power3.out" />
              </div>
              <TypographyMuted className="text-xs mt-1">{t("inProgress")}</TypographyMuted>
            </Card>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={0.18}>
            <Card className="rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{t("dayStreak")}</span>
                <div className="size-8 rounded-xl flex items-center justify-center bg-amber-100 dark:bg-amber-500/15">
                  <Flame className="size-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                <CountUp to={stats.streak} delay={0.6} duration={1.0} ease="power3.out" />
              </div>
              <TypographyMuted className="text-xs mt-1">{t("streakHint")}</TypographyMuted>
            </Card>
          </AnimateIn>

          <AnimateIn animation="fade-up" delay={0.22}>
            <Card className="rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">{t("totalXp")}</span>
                <div className="size-8 rounded-xl flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/15">
                  <Zap className="size-4 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="text-3xl font-bold text-foreground">
                <CountUp to={stats.xp} delay={0.7} duration={1.4} ease="power3.out" locale />
              </div>
              <TypographyMuted className="text-xs mt-1">
                {t("levelLabel", { level })}
              </TypographyMuted>
            </Card>
          </AnimateIn>
        </div>

        {/* This week + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* This week */}
          <AnimateIn animation="fade-up" delay={0.2}>
            <Card className="rounded-2xl p-5 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TypographyH3 className="font-semibold text-foreground text-base">{t("thisWeek")}</TypographyH3>
                {weekly !== null && (
                  <span className="text-xs text-muted-foreground">
                    {t("weeklyProgress", { done: weeklyDone, goal: profile.weeklyGoal })}
                  </span>
                )}
              </div>

              {weekly === null ? (
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-24 rounded-xl" />
                  <Skeleton className="h-1.5 rounded-full" />
                </div>
              ) : (
              <>
              {/* Day strip */}
              <div className="flex items-end justify-between gap-2 mb-4 flex-1 min-h-24">
                {weeklyActivity.map((day, i) => {
                  const pct    = (day.lessons / maxDay) * 100
                  const active = day.lessons > 0
                  return (
                    <div key={day.key} className="flex flex-col items-center gap-1.5 flex-1">
                      {/* Definite height: the columns size in %, which cannot
                          resolve against a flex-grown (auto-height) track. */}
                      <div className="w-full h-16 flex items-end justify-center">
                        <GrowBar
                          to={active ? Math.max(pct, 22) : 22}
                          axis="y"
                          delay={0.3 + i * 0.06}
                          duration={0.9}
                          ease="back.out(1.4)"
                          className={`w-full rounded-lg ${
                            active
                              ? "gradient-bg-primary"
                              : day.isToday
                                ? "border border-dashed border-violet-300 dark:border-violet-500/40"
                                : "bg-muted"
                          }`}
                          title={t("lessonsCount", { count: day.lessons })}
                        />
                      </div>
                      <span className={`text-[10px] ${
                        day.isToday
                          ? "font-bold text-violet-600 dark:text-violet-400"
                          : "text-muted-foreground"
                      }`}>
                        {t(`days.${day.key}`)}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Weekly goal bar */}
              <div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden mb-2">
                  <GrowBar
                    to={goalPct}
                    delay={0.75}
                    className="h-full rounded-full gradient-bg-primary"
                  />
                </div>
                <TypographyMuted className="text-xs">
                  {todayDone > 0
                    ? t("streakSafe")
                    : t("keepStreak", { days: stats.streak })}
                </TypographyMuted>
              </div>
              </>
              )}
            </Card>
          </AnimateIn>

          {/* Achievements */}
          <AnimateIn animation="fade-up" delay={0.2}>
            <Card className="rounded-2xl p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <TypographyH3 className="font-semibold text-foreground text-base">{t("achievements")}</TypographyH3>
                <span className="text-xs text-muted-foreground">
                  {t("earnedCount", { earned: earnedBadges, total: badges.length })}
                </span>
              </div>

              {badgeItems === null ? (
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {badges.map(({ badge, earned }) => {
                    const Icon = BADGE_ICONS[badge.icon ?? ""] ?? Medal
                    const progress =
                      !earned && badge.xpRequired
                        ? Math.min(100, Math.round((stats.xp / badge.xpRequired) * 100))
                        : null
                    return (
                      <div
                        key={badge.id}
                        className={`rounded-xl p-3 flex flex-col items-center text-center gap-1.5 border transition-all ${
                          earned
                            ? "border-violet-200 bg-violet-50/60 dark:border-violet-500/25 dark:bg-violet-500/10"
                            : "border-border bg-muted/40"
                        }`}
                        title={badge.description ?? badge.name}
                      >
                        <div className={`size-9 rounded-xl flex items-center justify-center relative ${
                          earned
                            ? "gradient-bg-primary"
                            : "bg-muted"
                        }`}>
                          <Icon className={`size-4 ${earned ? "text-white" : "text-muted-foreground/50"}`} />
                          {!earned && (
                            <div className="absolute -right-1 -bottom-1 size-4 rounded-full bg-background border border-border flex items-center justify-center">
                              <Lock className="size-2 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[10px] font-medium leading-tight ${
                          earned ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {badge.name}
                        </span>
                        {progress !== null && (
                          <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                            <GrowBar
                              to={progress}
                              delay={0.4}
                              className="h-full rounded-full bg-violet-400 dark:bg-violet-500"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </AnimateIn>
        </div>

        {/* My Courses */}
        <div className="space-y-4">
          <AnimateIn animation="fade-up" delay={0.25}>
            <div className="flex items-center justify-between">
              <TypographyH3 className="font-semibold text-foreground text-base">{t("myCourses")}</TypographyH3>
              <Link href="/courses">
                <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  {t("viewAll")} <ChevronRight className="size-3" />
                </button>
              </Link>
            </div>
          </AnimateIn>

          {myCourses === null && (
            <>
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </>
          )}

          {myCourses !== null && courses.length === 0 && (
            <Card className="rounded-2xl border-dashed p-10 text-center">
              <div className="size-12 rounded-2xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="size-5 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-semibold text-foreground text-base mb-1">{t("noCoursesTitle")}</h3>
              <TypographyMuted className="text-sm">{t("noCoursesDesc")}</TypographyMuted>
              <Button asChild variant="outline" size="sm" className="mt-4">
                <Link href="/courses">
                  {t("browseCourses")}
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            </Card>
          )}

          {courses.map((mc, i) => {
            const barColor = i % 2 === 0
              ? "from-violet-500 to-violet-400"
              : "from-cyan-500 to-cyan-400"
            return (
              <AnimateIn key={mc.course.id} animation="fade-up" delay={0.3 + i * 0.1}>
                <Card className="rounded-2xl p-5 group hover:border-violet-200 dark:hover:border-violet-500/25 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="size-11 rounded-xl bg-muted flex items-center justify-center shrink-0 transition-transform duration-300 motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6">
                      <BookOpen className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <Link href={`/courses/${mc.course.slug}`} className="hover:opacity-80 transition-opacity">
                          <TypographyH4 className="text-foreground text-sm">{mc.course.title}</TypographyH4>
                          {mc.course.titleKm && (
                            <TypographyMuted className="text-xs">{mc.course.titleKm}</TypographyMuted>
                          )}
                        </Link>
                        <span className="text-xs text-muted-foreground shrink-0 font-medium">
                          <CountUp
                            to={mc.enrollment.progressPercent}
                            suffix="%"
                            delay={0.45 + i * 0.1}
                            duration={1.1}
                            ease="power3.out"
                          />
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3 mt-2">
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <GrowBar
                            to={mc.enrollment.progressPercent}
                            delay={0.45 + i * 0.1}
                            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          {mc.nextLesson && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                              <Clock className="size-3 shrink-0" />
                              <span className="truncate">{mc.nextLesson.title}</span>
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground shrink-0">
                            {t("lessonProgress", { done: mc.completedLessons, total: mc.totalLessons })}
                          </span>
                        </div>
                        <Link
                          href={
                            mc.nextLesson
                              ? `/learn/${mc.course.slug}/${mc.nextLesson.slug}`
                              : `/learn/${mc.course.slug}`
                          }
                        >
                          <button className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1 group-hover:gap-1.5 transition-all shrink-0">
                            {t("continue")} <ArrowRight className="size-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimateIn>
            )
          })}
        </div>

        {/* Explore */}
        <div className="space-y-4">
          <AnimateIn animation="fade-up" delay={0.4}>
            <TypographyH3 className="font-semibold text-foreground text-base">{t("explore")}</TypographyH3>
          </AnimateIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { key: "exploreK12",   icon: School,   href: "/courses",      color: "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400" },
              { key: "exploreBacII", icon: Sparkles, href: "/courses/math", color: "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"     },
              { key: "exploreProg",  icon: Code2,    href: "/courses",      color: "bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"         },
            ].map(({ key, icon: Icon, href, color }, i) => (
              <AnimateIn key={key} animation="fade-up" delay={0.45 + i * 0.07}>
                <Link href={href} className="block group">
                  <Card className="rounded-2xl p-4 hover:border-violet-200 dark:hover:border-violet-500/25 hover:shadow-md transition-all flex-row items-center gap-3.5 h-full">
                    <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{t(`${key}Title`)}</div>
                      <div className="text-xs text-muted-foreground truncate">{t(`${key}Desc`)}</div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </Card>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  )
}
