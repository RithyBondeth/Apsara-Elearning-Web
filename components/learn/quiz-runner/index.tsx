"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Brain, Check, CheckCircle2, Loader2, RotateCcw, Sparkles, Trophy, X, XCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MathText } from "@/components/learn/math-text"
import { useProfileStore } from "@/stores/profiles/profile-store"
import { getLessonQuizzes, startQuiz, submitAttempt } from "@/lib/api/quiz"
import type {
  IApiQuizQuestion,
  IApiQuizResult,
  IApiQuizReviewItem,
  IQuizAnswerInput,
} from "@/utils/interfaces/quiz/api.interface"

type TPhase = "loading" | "none" | "intro" | "running" | "submitting" | "results"

interface QuizRunnerProps {
  /** The lesson's real id — the quiz is fetched per lesson. */
  lessonId: string
}

/** A lesson's practice quiz: intro → answer all → graded review. */
export function QuizRunner({ lessonId }: QuizRunnerProps) {
  const t = useTranslations("quiz")
  const setStats = useProfileStore((s) => s.setStats)

  const [phase, setPhase] = useState<TPhase>("loading")
  const [quizId, setQuizId] = useState<string | null>(null)
  const [quizTitle, setQuizTitle] = useState("")
  const [xpReward, setXpReward] = useState(0)
  const [questions, setQuestions] = useState<IApiQuizQuestion[]>([])
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, IQuizAnswerInput>>({})
  const [result, setResult] = useState<IApiQuizResult | null>(null)
  const [error, setError] = useState(false)

  /* One quiz per lesson here — pick the first. Reset on lesson change. */
  useEffect(() => {
    let cancelled = false
    setPhase("loading")
    setAttemptId(null)
    setAnswers({})
    setResult(null)
    setError(false)

    getLessonQuizzes(lessonId)
      .then((quizzes) => {
        if (cancelled) return
        const quiz = quizzes[0]
        if (!quiz) {
          setPhase("none")
          return
        }
        setQuizId(quiz.id)
        setQuizTitle(quiz.title)
        setXpReward(quiz.xpReward ?? 0)
        setPhase("intro")
      })
      .catch(() => {
        if (!cancelled) setPhase("none")
      })

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const begin = async () => {
    if (!quizId) return
    setError(false)
    try {
      const started = await startQuiz(quizId)
      setAttemptId(started.attempt.id)
      setQuestions([...started.questions].sort((a, b) => a.order - b.order))
      setAnswers({})
      setPhase("running")
    } catch {
      setError(true)
    }
  }

  const setAnswer = useCallback(
    (questionId: string, patch: Omit<IQuizAnswerInput, "questionId">) => {
      setAnswers((prev) => ({ ...prev, [questionId]: { questionId, ...patch } }))
    },
    []
  )

  const answeredCount = useMemo(
    () => questions.filter((q) => isAnswered(answers[q.id])).length,
    [questions, answers]
  )
  const allAnswered = questions.length > 0 && answeredCount === questions.length

  const submit = async () => {
    if (!attemptId || !allAnswered) return
    setPhase("submitting")
    setError(false)
    try {
      const res = await submitAttempt(attemptId, questions.map((q) => answers[q.id]))
      setResult(res)
      if (res.xpAwarded > 0) {
        const { xp, streak } = useProfileStore.getState()
        setStats({ xp: xp + res.xpAwarded, streak })
      }
      setPhase("results")
    } catch {
      setError(true)
      setPhase("running")
    }
  }

  if (phase === "loading" || phase === "none") return null

  /* ── Intro ──────────────────────────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <div className="mt-8 rounded-2xl border border-violet-200 bg-violet-50/50 p-5 dark:border-violet-500/25 dark:bg-violet-500/10">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/20">
            <Brain className="size-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">{t("practiceQuiz")}</div>
            <div className="text-xs text-muted-foreground">{quizTitle}</div>
            {xpReward > 0 && (
              <div className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                <Sparkles className="size-3.5" />
                {t("earnXp", { xp: xpReward })}
              </div>
            )}
          </div>
          <Button onClick={begin} className="btn-shine shrink-0">
            {t("start")}
          </Button>
        </div>
        {error && <p className="mt-3 text-xs text-destructive">{t("error")}</p>}
      </div>
    )
  }

  /* ── Results ────────────────────────────────────────────────────────── */
  if (phase === "results" && result) {
    return (
      <div className="mt-8 space-y-4">
        <QuizScoreCard result={result} t={t} />
        <div className="space-y-3">
          {result.review.map((item, i) => (
            <ReviewCard key={item.questionId} item={item} index={i} t={t} />
          ))}
        </div>
        <Button onClick={begin} variant="outline" className="w-full">
          <RotateCcw className="size-4" />
          {t("tryAgain")}
        </Button>
      </div>
    )
  }

  /* ── Running / submitting ───────────────────────────────────────────── */
  const submitting = phase === "submitting"
  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Brain className="size-4 text-violet-500" />
        {t("practiceQuiz")}
      </div>

      {questions.map((q, i) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={i}
          answer={answers[q.id]}
          disabled={submitting}
          onAnswer={(patch) => setAnswer(q.id, patch)}
          t={t}
        />
      ))}

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {t("answeredOf", { done: answeredCount, total: questions.length })}
        </span>
        <Button onClick={submit} disabled={!allAnswered || submitting} className="btn-shine">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : t("submit")}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{t("error")}</p>}
    </div>
  )
}

/* ── Answer state helpers ───────────────────────────────────────────────── */

function isAnswered(ans: IQuizAnswerInput | undefined): boolean {
  if (!ans) return false
  if (ans.selectedOptionId) return true
  const data = ans.answerData
  if (!data) return false
  if (typeof data.value === "boolean") return true
  if (typeof data.value === "string") return data.value.trim() !== ""
  if (typeof data.text === "string") return data.text.trim() !== ""
  return false
}

/* ── Question (answering mode) ──────────────────────────────────────────── */

function QuestionCard({
  question, index, answer, disabled, onAnswer, t,
}: {
  question: IApiQuizQuestion
  index: number
  answer: IQuizAnswerInput | undefined
  disabled: boolean
  onAnswer: (patch: Omit<IQuizAnswerInput, "questionId">) => void
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <div className="card-surface rounded-2xl border border-border p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground">
          {index + 1}
        </span>
        <p className="text-[15px] font-medium leading-7 text-foreground"><MathText>{question.question}</MathText></p>
      </div>

      <div className="pl-8">
        {question.type === "multiple_choice" && (
          <div className="space-y-2">
            {question.options.map((opt) => {
              const selected = answer?.selectedOptionId === opt.id
              return (
                <button
                  key={opt.id}
                  disabled={disabled}
                  onClick={() => onAnswer({ selectedOptionId: opt.id })}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                    selected
                      ? "border-violet-400 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-500/15"
                      : "border-border hover:border-violet-300 hover:bg-muted/50 dark:hover:border-violet-500/30"
                  }`}
                >
                  <span className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    selected ? "border-violet-500 dark:border-violet-400" : "border-muted-foreground/40"
                  }`}>
                    {selected && <span className="size-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />}
                  </span>
                  <span className="text-foreground"><MathText>{opt.answer}</MathText></span>
                </button>
              )
            })}
          </div>
        )}

        {question.type === "true_false" && (
          <div className="flex gap-2.5">
            {[true, false].map((val) => {
              const selected = answer?.answerData?.value === val
              return (
                <button
                  key={String(val)}
                  disabled={disabled}
                  onClick={() => onAnswer({ answerData: { value: val } })}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                    selected
                      ? "border-violet-400 bg-violet-50 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/15 dark:text-violet-300"
                      : "border-border text-foreground hover:border-violet-300 hover:bg-muted/50"
                  }`}
                >
                  {val ? t("true") : t("false")}
                </button>
              )
            })}
          </div>
        )}

        {question.type === "numeric" && (
          <Input
            type="number"
            inputMode="decimal"
            disabled={disabled}
            placeholder={t("numericPlaceholder")}
            value={typeof answer?.answerData?.value === "string" ? answer.answerData.value : ""}
            onChange={(e) => onAnswer({ answerData: { value: e.target.value } })}
            className="max-w-xs"
          />
        )}

        {(question.type === "fill_blank" || question.type === "short_answer") && (
          <Input
            disabled={disabled}
            placeholder={t("textPlaceholder")}
            value={typeof answer?.answerData?.text === "string" ? answer.answerData.text : ""}
            onChange={(e) => onAnswer({ answerData: { text: e.target.value } })}
            className="max-w-sm"
          />
        )}
      </div>
    </div>
  )
}

/* ── Score summary ──────────────────────────────────────────────────────── */

function QuizScoreCard({
  result, t,
}: {
  result: IApiQuizResult
  t: ReturnType<typeof useTranslations>
}) {
  const tone = result.passed
    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10"
    : "border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10"
  return (
    <div className={`rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-center gap-3">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
          result.passed ? "bg-emerald-100 dark:bg-emerald-500/20" : "bg-amber-100 dark:bg-amber-500/20"
        }`}>
          {result.passed
            ? <Trophy className="size-5 text-emerald-600 dark:text-emerald-400" />
            : <RotateCcw className="size-5 text-amber-600 dark:text-amber-400" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-foreground">
            {result.passed ? t("passTitle") : t("failTitle")}
          </div>
          <div className="text-sm text-muted-foreground">
            {t("correctCount", { correct: result.correctAnswers, total: result.total })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold gradient-text leading-none">{result.score}%</div>
          {result.xpAwarded > 0 && (
            <div className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3" />
              {t("xpEarned", { xp: result.xpAwarded })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Per-question review ────────────────────────────────────────────────── */

function ReviewCard({
  item, index, t,
}: {
  item: IApiQuizReviewItem
  index: number
  t: ReturnType<typeof useTranslations>
}) {
  const correctText = correctAnswerText(item, t)
  const yourText = yourAnswerText(item, t)

  return (
    <div className={`card-surface rounded-2xl border p-4 sm:p-5 ${
      item.isCorrect
        ? "border-emerald-200 dark:border-emerald-500/25"
        : "border-red-200 dark:border-red-500/25"
    }`}>
      <div className="mb-3 flex items-start gap-2">
        <span className="mt-0.5 shrink-0">
          {item.isCorrect
            ? <CheckCircle2 className="size-5 text-emerald-500" />
            : <XCircle className="size-5 text-red-500" />}
        </span>
        <p className="text-[15px] font-medium leading-7 text-foreground">
          <span className="text-muted-foreground">{index + 1}. </span>
          <MathText>{item.question}</MathText>
        </p>
      </div>

      {/* For multiple choice, show every option with correctness. */}
      {item.type === "multiple_choice" ? (
        <div className="space-y-1.5 pl-7">
          {item.options.map((opt) => {
            const picked = item.yourAnswer?.selectedOptionId === opt.id
            return (
              <div
                key={opt.id}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                  opt.isCorrect
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : picked
                      ? "bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300"
                      : "text-muted-foreground"
                }`}
              >
                {opt.isCorrect
                  ? <Check className="size-3.5 shrink-0" />
                  : picked
                    ? <X className="size-3.5 shrink-0" />
                    : <span className="size-3.5 shrink-0" />}
                <span><MathText>{opt.answer}</MathText></span>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="space-y-1 pl-7 text-sm">
          <div className={item.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
            <span className="text-muted-foreground">{t("yourAnswer")}: </span>
            <MathText>{yourText}</MathText>
          </div>
          {!item.isCorrect && (
            <div className="text-emerald-700 dark:text-emerald-400">
              <span className="text-muted-foreground">{t("correctAnswer")}: </span>
              <MathText>{correctText}</MathText>
            </div>
          )}
        </div>
      )}

      {item.explanation && (
        <div className="mt-3 ml-7 rounded-xl border-l-2 border-violet-300 bg-muted/40 px-3.5 py-2.5 text-sm leading-7 text-muted-foreground dark:border-violet-500/40">
          <MathText>{item.explanation}</MathText>
        </div>
      )}
    </div>
  )
}

/* ── Answer formatting for the review ───────────────────────────────────── */

function yourAnswerText(item: IApiQuizReviewItem, t: ReturnType<typeof useTranslations>): string {
  const data = item.yourAnswer?.answerData
  if (item.type === "true_false") {
    if (typeof data?.value === "boolean") return data.value ? t("true") : t("false")
    return "—"
  }
  if (item.type === "numeric") return data?.value != null ? String(data.value) : "—"
  if (typeof data?.text === "string" && data.text.trim()) return data.text
  return "—"
}

function correctAnswerText(item: IApiQuizReviewItem, t: ReturnType<typeof useTranslations>): string {
  const spec = item.correctAnswer ?? {}
  if (item.type === "true_false") {
    return spec.value ? t("true") : t("false")
  }
  if (item.type === "numeric") return spec.value != null ? String(spec.value) : "—"
  if (Array.isArray(spec.accepted) && spec.accepted.length) {
    return (spec.accepted as unknown[]).map(String).join(" / ")
  }
  return "—"
}
