"use client"

import { Check, CheckCircle2, RotateCcw, Sparkles, Trophy, X, XCircle } from "lucide-react"
import type { useTranslations } from "next-intl"
import { MathText } from "@/components/learn/math-text"
import type {
  IApiQuizAttemptReview,
  IApiQuizReviewItem,
} from "@/utils/interfaces/quiz/api.interface"

/*
 * The graded view of a quiz attempt — shared by the lesson's quiz runner
 * (right after submitting) and the activity history (re-opening an attempt),
 * so a reviewed attempt looks the same wherever it's opened.
 */

type TQuizT = ReturnType<typeof useTranslations>

/* ── Score summary ──────────────────────────────────────────────────────── */

export function QuizScoreCard({
  result, t,
}: {
  /** XP is only known right after submitting; a re-opened attempt has none. */
  result: IApiQuizAttemptReview & { xpAwarded?: number }
  t: TQuizT
}) {
  const xpAwarded = result.xpAwarded ?? 0
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
          {xpAwarded > 0 && (
            <div className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3" />
              {t("xpEarned", { xp: xpAwarded })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Per-question review ────────────────────────────────────────────────── */

export function QuizReviewCard({
  item, index, t,
}: {
  item: IApiQuizReviewItem
  index: number
  t: TQuizT
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

function yourAnswerText(item: IApiQuizReviewItem, t: TQuizT): string {
  const data = item.yourAnswer?.answerData
  if (item.type === "true_false") {
    if (typeof data?.value === "boolean") return data.value ? t("true") : t("false")
    return "—"
  }
  if (item.type === "numeric") return data?.value != null ? String(data.value) : "—"
  if (typeof data?.text === "string" && data.text.trim()) return data.text
  return "—"
}

function correctAnswerText(item: IApiQuizReviewItem, t: TQuizT): string {
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
