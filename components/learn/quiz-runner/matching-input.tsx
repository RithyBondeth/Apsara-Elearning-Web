"use client"

import { ArrowRight } from "lucide-react"
import type { useTranslations } from "next-intl"
import { MathText } from "@/components/learn/math-text"

/*
 * Answering a matching question: every left item gets a select of the
 * (server-shuffled) right items. The answer goes up as
 * `answerData: { pairs: [{ left, right }] }`, which assessment-service grades
 * by left item, so the order of `pairs` doesn't matter.
 */

export interface IMatchPair {
  left: string
  right: string
}

/** The pairs picked so far, read leniently from a stored answer. */
export function readPairs(data: Record<string, unknown> | undefined): IMatchPair[] {
  if (!Array.isArray(data?.pairs)) return []
  return (data.pairs as unknown[]).filter(
    (p): p is IMatchPair =>
      typeof (p as IMatchPair)?.left === "string" && typeof (p as IMatchPair)?.right === "string"
  )
}

/** Complete once every left item has a right picked for it. */
export function isMatchingComplete(
  lefts: string[],
  data: Record<string, unknown> | undefined
): boolean {
  if (lefts.length === 0) return false
  const picked = new Set(readPairs(data).filter((p) => p.right !== "").map((p) => p.left))
  return lefts.every((left) => picked.has(left))
}

export function MatchingInput({
  lefts, rights, value, disabled, onChange, t,
}: {
  lefts: string[]
  rights: string[]
  value: Record<string, unknown> | undefined
  disabled: boolean
  onChange: (answerData: { pairs: IMatchPair[] }) => void
  t: ReturnType<typeof useTranslations>
}) {
  const pairs = readPairs(value)
  const rightFor = (left: string) => pairs.find((p) => p.left === left)?.right ?? ""

  const pick = (left: string, right: string) => {
    /* Keep the pairs in left-item order so the stored answer reads naturally. */
    const next = lefts
      .map((l) => ({ left: l, right: l === left ? right : rightFor(l) }))
      .filter((p) => p.right !== "")
    onChange({ pairs: next })
  }

  return (
    <div className="space-y-2.5">
      {lefts.map((left, i) => {
        const chosen = rightFor(left)
        /* Options are keyed by position: two right items may share a wording. */
        const selectedIndex = chosen === "" ? "" : String(rights.indexOf(chosen))
        return (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border border-border px-3.5 py-2.5 sm:flex-row sm:items-center sm:gap-3"
          >
            <span className="min-w-0 flex-1 text-sm text-foreground">
              <MathText>{left}</MathText>
            </span>
            <ArrowRight className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
            <select
              aria-label={t("matchFor", { item: left })}
              disabled={disabled}
              value={selectedIndex}
              onChange={(e) => pick(left, e.target.value === "" ? "" : rights[Number(e.target.value)])}
              className={`h-9 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 sm:w-56 dark:bg-input/30 ${
                chosen
                  ? "border-violet-400 text-foreground dark:border-violet-500/50"
                  : "border-input text-muted-foreground"
              }`}
            >
              <option value="">{t("matchPlaceholder")}</option>
              {rights.map((right, j) => (
                <option key={j} value={String(j)}>
                  {right}
                </option>
              ))}
            </select>
          </div>
        )
      })}
    </div>
  )
}
