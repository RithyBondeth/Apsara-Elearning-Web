"use client"

import Link from "next/link"
import { useState } from "react"
import {
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  Code2,
  FileQuestion,
  Loader2,
  TriangleAlert,
  XCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Card } from "@/components/ui/card"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH4 } from "@/components/utils/typography/typography-h4"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { useActivity } from "@/hooks/utils/use-activity"
import type { IApiChallengeSubmission } from "@/utils/interfaces/challenge/api.interface"

/** Quizzes pass at 70% server-side; the badge has to agree with the grader. */
const PASS_MARK = 70

function formatDate(iso: string, locale: string) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(locale === "km" ? "km-KH" : "en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
}

export default function ActivityPage() {
  const t = useTranslations("activity")
  const { attempts, submissions, error } = useActivity()
  const loading = attempts === null || submissions === null

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {loading && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {error && (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-5 dark:border-amber-500/25 dark:bg-amber-500/10">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* Quiz attempts */}
            <section className="space-y-3">
              <TypographyH4 className="flex items-center gap-2 text-foreground">
                <FileQuestion className="size-4 text-violet-600 dark:text-violet-400" />
                {t("quizzesTitle")}
              </TypographyH4>

              {attempts.length === 0 ? (
                <Card className="p-6 text-center">
                  <TypographyMuted className="text-sm">
                    {t("noQuizzes")}
                  </TypographyMuted>
                </Card>
              ) : (
                attempts.map((attempt, index) => {
                  const submitted = attempt.completedAt !== null
                  const score = attempt.score ?? 0
                  const passed = submitted && score >= PASS_MARK
                  return (
                    <AnimateIn
                      key={attempt.id}
                      animation="fade-up"
                      delay={0.04 * index}
                    >
                      <Card className="flex flex-wrap items-center gap-4 p-4">
                        {!submitted ? (
                          <CircleDashed className="size-5 shrink-0 text-muted-foreground" />
                        ) : passed ? (
                          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="size-5 shrink-0 text-red-500 dark:text-red-400" />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">
                            {attempt.quizTitle ?? t("untitledQuiz")}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {attempt.lessonTitle ?? ""}
                            {attempt.lessonTitle && " · "}
                            {formatDate(
                              attempt.completedAt ?? attempt.createdAt,
                              "en"
                            )}
                          </p>
                        </div>

                        {!submitted ? (
                          <p className="text-sm text-muted-foreground">
                            {t("inProgress")}
                          </p>
                        ) : (
                          <div className="text-right">
                            <p
                              className={`font-semibold ${
                                passed
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-red-500 dark:text-red-400"
                              }`}
                            >
                              {score}%
                            </p>
                            {attempt.correctAnswers !== null &&
                              attempt.totalQuestions > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {t("correctOf", {
                                    correct: attempt.correctAnswers,
                                    total: attempt.totalQuestions,
                                  })}
                                </p>
                              )}
                          </div>
                        )}

                        {submitted ? (
                          <Link
                            href={`/activity/quiz/${attempt.id}`}
                            className="text-sm font-medium text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
                          >
                            {t("review")}
                          </Link>
                        ) : (
                          attempt.courseSlug &&
                          attempt.lessonId && (
                            <Link
                              href={`/learn/${attempt.courseSlug}/${attempt.lessonId}`}
                              className="text-sm font-medium text-violet-600 underline-offset-4 hover:underline dark:text-violet-400"
                            >
                              {t("openLesson")}
                            </Link>
                          )
                        )}
                      </Card>
                    </AnimateIn>
                  )
                })
              )}
            </section>

            {/* Coding submissions */}
            <section className="space-y-3">
              <TypographyH4 className="flex items-center gap-2 text-foreground">
                <Code2 className="size-4 text-cyan-600 dark:text-cyan-400" />
                {t("challengesTitle")}
              </TypographyH4>

              {submissions.length === 0 ? (
                <Card className="p-6 text-center">
                  <TypographyMuted className="text-sm">
                    {t("noChallenges")}
                  </TypographyMuted>
                </Card>
              ) : (
                submissions.map((submission, index) => (
                  <AnimateIn
                    key={submission.id}
                    animation="fade-up"
                    delay={0.04 * index}
                  >
                    <SubmissionCard submission={submission} />
                  </AnimateIn>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  )
}

/** A coding submission that expands to the code that was run and any error. */
function SubmissionCard({
  submission,
}: {
  submission: IApiChallengeSubmission
}) {
  const t = useTranslations("activity")
  const [open, setOpen] = useState(false)

  return (
    <Card className="gap-0 p-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-4 p-4 text-left"
      >
        {submission.passed ? (
          <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle className="size-5 shrink-0 text-red-500 dark:text-red-400" />
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">
            {submission.challengeTitle ?? t("untitledChallenge")}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {submission.language} · {formatDate(submission.createdAt, "en")}
          </p>
        </div>

        {submission.testCasesTotal ? (
          <p className="text-sm text-muted-foreground">
            {t("testsPassed", {
              passed: submission.testCasesPassed ?? 0,
              total: submission.testCasesTotal,
            })}
          </p>
        ) : null}

        <span className="flex items-center gap-1 text-sm font-medium text-cyan-600 dark:text-cyan-400">
          {open ? t("hideCode") : t("showCode")}
          <ChevronDown
            className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-border p-4">
          <pre className="max-h-96 overflow-auto rounded-xl bg-muted/60 p-4 font-mono text-xs leading-6 text-foreground">
            <code>{submission.sourceCode}</code>
          </pre>
          {submission.errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-3 dark:border-red-500/25 dark:bg-red-500/10">
              <p className="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">
                {t("errorOutput")}
              </p>
              <pre className="overflow-auto font-mono text-xs whitespace-pre-wrap text-red-800 dark:text-red-300">
                {submission.errorMessage}
              </pre>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
