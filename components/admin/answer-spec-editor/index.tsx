"use client"

import { Plus, TriangleAlert, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import type { IAnswerDraft } from "@/lib/admin/answer-spec"
import type { TQuestionType } from "@/utils/interfaces/admin/api.interface"

/**
 * The "correct answer" part of the question form, shaped by question type.
 *
 * Replaces a raw JSON box: authors pick True/False, type a number, or list
 * accepted answers and pairs, and `fromDraft` turns that into the spec the
 * grader reads. Multiple choice renders nothing — its answer is the option
 * flagged correct.
 */
export function AnswerSpecEditor({
  id,
  type,
  draft,
  onChange,
}: {
  id: string
  type: TQuestionType
  draft: IAnswerDraft
  onChange: (draft: IAnswerDraft) => void
}) {
  const set = (patch: Partial<IAnswerDraft>) => onChange({ ...draft, ...patch })

  if (type === "true_false") {
    return (
      <RadioGroup
        id={id}
        value={draft.truth === undefined ? "" : String(draft.truth)}
        onValueChange={(v) => set({ truth: v === "true" })}
        className="flex gap-6 pt-1"
      >
        {(["true", "false"] as const).map((v) => (
          <label
            key={v}
            className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
          >
            <RadioGroupItem value={v} aria-label={v === "true" ? "True" : "False"} />
            {v === "true" ? "True" : "False"}
          </label>
        ))}
      </RadioGroup>
    )
  }

  if (type === "numeric") {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Correct number</span>
          <Input
            id={id}
            inputMode="decimal"
            value={draft.value ?? ""}
            placeholder="42"
            onChange={(e) => set({ value: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">Allowed ± (optional)</span>
          <Input
            aria-label="Tolerance"
            inputMode="decimal"
            value={draft.tolerance ?? ""}
            placeholder="0.5"
            onChange={(e) => set({ tolerance: e.target.value })}
          />
        </div>
        <p className="col-span-2 text-xs text-muted-foreground">
          {tolerancePhrase(draft)}
        </p>
      </div>
    )
  }

  if (type === "fill_blank" || type === "short_answer") {
    const accepted = draft.accepted?.length ? draft.accepted : [""]
    const update = (next: string[]) => set({ accepted: next })

    return (
      <div className="space-y-2">
        {accepted.map((answer, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              id={i === 0 ? id : undefined}
              aria-label={`Accepted answer ${i + 1}`}
              value={answer}
              placeholder={i === 0 ? "Accepted answer" : "Another accepted answer"}
              onChange={(e) =>
                update(accepted.map((a, j) => (j === i ? e.target.value : a)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove accepted answer ${i + 1}`}
              disabled={accepted.length === 1 && !answer}
              onClick={() => update(accepted.filter((_, j) => j !== i))}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={() => update([...accepted, ""])}
          >
            <Plus className="size-3" />
            Add another accepted answer
          </Button>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              size="sm"
              checked={draft.caseSensitive === true}
              onCheckedChange={(c) => set({ caseSensitive: c })}
              aria-label="Case sensitive"
            />
            Case sensitive
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {type === "short_answer" && !accepted.some((a) => a.trim())
            ? "No accepted answers — every response goes to Grading for a teacher to mark."
            : "Extra spaces are ignored. Any one of these counts as correct."}
        </p>
      </div>
    )
  }

  if (type === "matching") {
    const pairs = draft.pairs?.length
      ? draft.pairs
      : [
          { left: "", right: "" },
          { left: "", right: "" },
        ]
    const update = (next: IAnswerDraft["pairs"]) => set({ pairs: next })

    return (
      <div className="space-y-2">
        {pairs.map((pair, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              id={i === 0 ? id : undefined}
              aria-label={`Pair ${i + 1} left`}
              value={pair.left}
              placeholder="Left"
              onChange={(e) =>
                update(pairs.map((p, j) => (j === i ? { ...p, left: e.target.value } : p)))
              }
            />
            <span className="text-muted-foreground" aria-hidden>
              →
            </span>
            <Input
              aria-label={`Pair ${i + 1} right`}
              value={pair.right}
              placeholder="Matches"
              onChange={(e) =>
                update(pairs.map((p, j) => (j === i ? { ...p, right: e.target.value } : p)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove pair ${i + 1}`}
              disabled={pairs.length <= 2}
              onClick={() => update(pairs.filter((_, j) => j !== i))}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={() => update([...pairs, { left: "", right: "" }])}
        >
          <Plus className="size-3" />
          Add pair
        </Button>
        {/* The quiz runner has no matching input yet (components/learn/quiz-runner),
            so a learner can only leave it blank. Say so where it's authored. */}
        <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <TriangleAlert className="mt-px size-3.5 shrink-0" />
          Learners can&apos;t answer matching questions yet — the quiz shows no
          input, so they&apos;re always marked wrong. Use another type for now.
        </p>
      </div>
    )
  }

  return null
}

function tolerancePhrase(draft: IAnswerDraft): string {
  const value = Number(draft.value)
  const tolerance = Number(draft.tolerance)
  if (!draft.value?.trim() || !Number.isFinite(value)) {
    return "Learners type a number; it's correct when it's within the allowed difference."
  }
  if (!draft.tolerance?.trim() || !(tolerance > 0)) {
    return `Only exactly ${value} is correct.`
  }
  /* toPrecision trims float noise: 3.14 − 0.01 is 3.1300000000000003. */
  const show = (n: number) => String(Number(n.toPrecision(12)))
  return `Anything from ${show(value - tolerance)} to ${show(value + tolerance)} is correct.`
}
