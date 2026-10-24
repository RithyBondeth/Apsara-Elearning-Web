import type { TQuestionType } from "@/utils/interfaces/admin/api.interface"

/**
 * Form-side shape of a question's answer spec.
 *
 * One loose object covers every type, so switching a question from fill-blank
 * to short-answer keeps the accepted answers the author already typed. Numbers
 * stay strings while editing — "-" and "0." are valid half-typed values that
 * `Number()` would destroy.
 *
 * The API shapes it maps to are the ones `assessment-service` grades against
 * (`apps/assessment-service/src/services/graders/index.ts`).
 */
export interface IAnswerDraft {
  /** true_false: the correct value. */
  truth?: boolean
  /** numeric: expected value and allowed ± difference. */
  value?: string
  tolerance?: string
  /** fill_blank / short_answer. */
  accepted?: string[]
  caseSensitive?: boolean
  /** matching. */
  pairs?: { left: string; right: string }[]
}

const toBool = (v: unknown): boolean | undefined => {
  if (typeof v === "boolean") return v
  if (v === "true") return true
  if (v === "false") return false
  return undefined
}

const toText = (v: unknown): string =>
  typeof v === "number" || typeof v === "string" ? String(v) : ""

/** API spec (whatever is stored) → editable draft. Unknown keys are dropped. */
export function toDraft(spec: unknown): IAnswerDraft {
  const s =
    typeof spec === "object" && spec !== null && !Array.isArray(spec)
      ? (spec as Record<string, unknown>)
      : {}

  const draft: IAnswerDraft = {}
  const truth = toBool(s.value)
  if (truth !== undefined) draft.truth = truth
  if (typeof s.value === "number" || typeof s.value === "string") {
    draft.value = toText(s.value)
  }
  if (s.tolerance !== undefined) draft.tolerance = toText(s.tolerance)
  if (Array.isArray(s.accepted)) {
    draft.accepted = s.accepted.filter((a): a is string => typeof a === "string")
  }
  if (s.caseSensitive === true) draft.caseSensitive = true
  if (Array.isArray(s.pairs)) {
    draft.pairs = s.pairs
      .filter(
        (p): p is { left: unknown; right: unknown } =>
          typeof p === "object" && p !== null
      )
      .map((p) => ({ left: toText(p.left), right: toText(p.right) }))
  }
  return draft
}

const cleanList = (list: string[] | undefined) =>
  (list ?? []).map((a) => a.trim()).filter(Boolean)

const cleanPairs = (pairs: IAnswerDraft["pairs"]) =>
  (pairs ?? [])
    .map((p) => ({ left: p.left.trim(), right: p.right.trim() }))
    .filter((p) => p.left || p.right)

/* Same folding the grader applies before comparing. */
const fold = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase()

/**
 * Mirrors what the grader can actually score, so a spec that would silently
 * send every answer to manual review (or never match) is caught in the form.
 * Returns a ready-to-show message, or null when the draft is usable.
 */
export function validateDraft(
  type: TQuestionType,
  draft: IAnswerDraft
): string | null {
  switch (type) {
    case "multiple_choice":
      return null

    case "true_false":
      return draft.truth === undefined ? "Choose whether the answer is True or False" : null

    case "numeric": {
      if (!draft.value?.trim()) return "Enter the correct number"
      if (!Number.isFinite(Number(draft.value))) return "The correct answer must be a number"
      const tolerance = draft.tolerance?.trim()
      if (tolerance && !(Number(tolerance) >= 0)) {
        return "Tolerance must be zero or a positive number"
      }
      return null
    }

    case "fill_blank":
      return cleanList(draft.accepted).length === 0
        ? "Add at least one accepted answer"
        : null

    /* An empty list is allowed: the grader sends every answer to review. */
    case "short_answer":
      return null

    case "matching": {
      const raw = draft.pairs ?? []
      if (raw.some((p) => !p.left.trim() !== !p.right.trim())) {
        return "Every pair needs both a left and a right side"
      }
      const pairs = cleanPairs(raw)
      if (pairs.length < 2) return "Add at least two pairs"
      /* The grader keys submissions by the left side, so two equal lefts
         would make the question impossible to answer correctly. */
      const lefts = new Set(pairs.map((p) => fold(p.left)))
      if (lefts.size !== pairs.length) return "Each left side must be different"
      return null
    }
  }
}

/**
 * Draft → the object the API stores. Call only after `validateDraft` passes.
 * Returns null for multiple choice, whose correctness lives on the options.
 */
export function fromDraft(
  type: TQuestionType,
  draft: IAnswerDraft
): Record<string, unknown> | null {
  switch (type) {
    case "multiple_choice":
      return null
    case "true_false":
      return { value: draft.truth === true }
    case "numeric": {
      const tolerance = draft.tolerance?.trim()
      return tolerance
        ? { value: Number(draft.value), tolerance: Number(tolerance) }
        : { value: Number(draft.value) }
    }
    case "fill_blank":
    case "short_answer":
      return {
        accepted: cleanList(draft.accepted),
        caseSensitive: draft.caseSensitive === true,
      }
    case "matching":
      return { pairs: cleanPairs(draft.pairs) }
  }
}
