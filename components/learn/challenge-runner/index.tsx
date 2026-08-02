"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Code2,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  XCircle,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  getChallengeTestCases,
  getLessonChallenges,
  submitChallenge,
} from "@/lib/api/challenge"
import { useProfileStore } from "@/stores/profiles/profile-store"
import type {
  IApiChallenge,
  IApiChallengeResult,
  IApiChallengeTestCase,
} from "@/utils/interfaces/challenge/api.interface"

const LANGUAGES = [
  ["javascript", "JavaScript"],
  ["typescript", "TypeScript"],
  ["python", "Python"],
  ["java", "Java"],
  ["cpp", "C++"],
] as const

interface ChallengeRunnerProps {
  lessonId: string
}

export function ChallengeRunner({ lessonId }: ChallengeRunnerProps) {
  const t = useTranslations("challenge")
  const setStats = useProfileStore((state) => state.setStats)
  const [loading, setLoading] = useState(true)
  const [challenge, setChallenge] = useState<IApiChallenge | null>(null)
  const [testCases, setTestCases] = useState<IApiChallengeTestCase[]>([])
  const [sourceCode, setSourceCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<IApiChallengeResult | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    // A lesson change starts a new server-backed challenge session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setChallenge(null)
    setTestCases([])
    setResult(null)
    setError(false)

    getLessonChallenges(lessonId)
      .then(async (challenges) => {
        const next = challenges[0] ?? null
        const cases = next ? await getChallengeTestCases(next.id) : []
        if (cancelled) return
        setChallenge(next)
        setTestCases([...cases].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
        setSourceCode(next?.starterCode ?? "")
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError(true)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [lessonId])

  const reset = () => {
    setSourceCode(challenge?.starterCode ?? "")
    setResult(null)
    setError(false)
  }

  const submit = async () => {
    if (!challenge || !sourceCode.trim() || submitting) return
    setSubmitting(true)
    setError(false)
    try {
      const next = await submitChallenge(challenge.id, sourceCode, language)
      setResult(next)
      if (next.xpAwarded > 0) {
        const { xp, streak } = useProfileStore.getState()
        setStats({ xp: xp + next.xpAwarded, streak })
      }
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || (!challenge && !error)) return null

  if (!challenge) {
    return (
      <p className="mt-8 rounded-2xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
        {t("loadError")}
      </p>
    )
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-cyan-200 bg-cyan-50/40 dark:border-cyan-500/25 dark:bg-cyan-500/5">
      <div className="flex items-start gap-3 border-b border-cyan-200/70 p-5 dark:border-cyan-500/20">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 dark:bg-cyan-500/15">
          <Code2 className="size-5 text-cyan-700 dark:text-cyan-300" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-cyan-700 uppercase dark:text-cyan-300">
            {t("title")}
          </p>
          <h3 className="mt-0.5 text-base font-semibold text-foreground">
            {challenge.title}
          </h3>
          {challenge.description && (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {challenge.description}
            </p>
          )}
          {(challenge.xpReward ?? 0) > 0 && (
            <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3.5" />
              {t("earnXp", { xp: challenge.xpReward ?? 0 })}
            </p>
          )}
        </div>
      </div>

      {testCases.length > 0 && (
        <div className="grid gap-2 border-b border-cyan-200/70 p-4 sm:grid-cols-2 dark:border-cyan-500/20">
          {testCases.map((testCase, index) => (
            <div
              key={testCase.id}
              className="rounded-xl border border-border bg-background/70 p-3 font-mono text-xs"
            >
              <p className="mb-2 font-sans font-semibold text-muted-foreground">
                {t("example", { n: index + 1 })}
              </p>
              <p>
                <span className="text-muted-foreground">{t("input")}:</span>{" "}
                {testCase.input || "—"}
              </p>
              <p className="mt-1">
                <span className="text-muted-foreground">{t("output")}:</span>{" "}
                {testCase.expectedOutput}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Terminal className="size-3.5" />
            {t("language")}
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground"
            >
              {LANGUAGES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            <RotateCcw className="size-3.5" />
            {t("reset")}
          </Button>
        </div>

        <textarea
          aria-label={t("editorLabel")}
          value={sourceCode}
          onChange={(event) => setSourceCode(event.target.value)}
          spellCheck={false}
          className="min-h-56 w-full resize-y rounded-xl border border-border bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none focus:border-cyan-500"
        />

        {result && (
          <div
            className={`mt-4 flex items-start gap-3 rounded-xl border p-4 ${result.passed ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-500/25 dark:bg-emerald-500/10" : "border-amber-200 bg-amber-50/70 dark:border-amber-500/25 dark:bg-amber-500/10"}`}
          >
            {result.passed ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            )}
            <div>
              <p className="text-sm font-semibold text-foreground">
                {result.passed ? t("passed") : t("notPassed")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t("testsPassed", {
                  passed: result.testCasesPassed,
                  total: result.testCasesTotal,
                })}
                {result.xpAwarded > 0 ? ` · +${result.xpAwarded} XP` : ""}
              </p>
              {result.mock && (
                <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                  {t("mockNotice")}
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs text-destructive">{t("submitError")}</p>
        )}

        <Button
          type="button"
          onClick={submit}
          disabled={submitting || !sourceCode.trim()}
          className="btn-shine mt-4 w-full"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Play className="size-4" />
          )}
          {submitting ? t("running") : t("run")}
        </Button>
      </div>
    </section>
  )
}
