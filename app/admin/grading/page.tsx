"use client"

import { useEffect, useState } from "react"
import { CheckCircle2, Loader2, Pencil, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { gradeAnswer, listGrading } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import type {
  IAdminGradingItem,
  TGradingStatus,
} from "@/utils/interfaces/admin/api.interface"

/** Above this many points, a number field beats a row of buttons. */
const MAX_POINT_BUTTONS = 10

export default function GradingPage() {
  const [status, setStatus] = useState<TGradingStatus>("pending")
  const [items, setItems] = useState<IAdminGradingItem[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let cancelled = false
    listGrading(status).then(
      (rows) => {
        if (cancelled) return
        setItems(rows)
        setFailed(false)
      },
      () => {
        if (cancelled) return
        setItems([])
        setFailed(true)
      }
    )
    return () => {
      cancelled = true
    }
  }, [status, nonce])

  function switchTo(next: TGradingStatus) {
    if (next === status) return
    setItems(null)
    setStatus(next)
  }

  /* A graded answer leaves the pending queue; a regrade updates in place. */
  function onGraded(updated: IAdminGradingItem) {
    setItems(
      (list) =>
        (status === "pending"
          ? list?.filter((i) => i.answerId !== updated.answerId)
          : list?.map((i) =>
              i.answerId === updated.answerId ? updated : i
            )) ?? null
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Grading</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Short answers the quiz couldn&apos;t mark by itself, because their
          question has no list of accepted answers. Each grade updates the
          learner&apos;s score; passing for the first time earns the quiz XP,
          and the learner is told once their attempt is fully graded.
        </p>
      </div>

      <div className="flex gap-1 text-sm">
        {(["pending", "graded"] as const).map((s) => (
          <button
            key={s}
            onClick={() => switchTo(s)}
            className={`rounded-md px-3 py-1 capitalize ${
              status === s
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {s === "pending" ? "To grade" : "Graded"}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading answers…
        </div>
      ) : failed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load answers.
          <button
            onClick={() => setNonce((n) => n + 1)}
            className="ml-1 font-medium underline"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border px-4 py-12 text-center text-sm text-muted-foreground">
          {status === "pending"
            ? "Nothing to grade. Every answer has a score."
            : "No answers have been graded yet."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <GradingCard key={item.answerId} item={item} onGraded={onGraded} />
          ))}
        </div>
      )}
    </div>
  )
}

function GradingCard({
  item,
  onGraded,
}: {
  item: IAdminGradingItem
  onGraded: (updated: IAdminGradingItem) => void
}) {
  const graded = item.status === "graded"
  const [editing, setEditing] = useState(!graded)
  const [points, setPoints] = useState<number | null>(
    graded ? item.pointsAwarded : null
  )
  const [feedback, setFeedback] = useState(item.feedback ?? "")
  const [saving, setSaving] = useState(false)

  async function save() {
    if (points === null) return
    setSaving(true)
    try {
      const result = await gradeAnswer(item.answerId, {
        points,
        feedback: feedback.trim() || undefined,
      })
      const xp = result.xpAwarded > 0 ? `, +${result.xpAwarded} XP` : ""
      const more =
        result.stillPending > 0
          ? ` · ${result.stillPending} more on this attempt`
          : ""
      toast.success(
        `Graded — attempt now ${result.attemptScore}% (${
          result.attemptPassed ? "passed" : "not passed"
        }${xp})${more}`
      )
      setEditing(false)
      onGraded(result.item)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not save grade"
      )
    } finally {
      setSaving(false)
    }
  }

  const placement = [item.courseTitle, item.lessonTitle, item.quizTitle]
    .filter(Boolean)
    .join(" › ")

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-foreground">
            {item.learnerName ?? "Deleted account"}
            {item.learnerEmail && (
              <span className="ml-2 font-normal text-muted-foreground">
                {item.learnerEmail}
              </span>
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {placement} · {new Date(item.submittedAt).toLocaleString()}
          </div>
        </div>
        {graded && !editing && (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <CheckCircle2 className="size-3" />
            {item.pointsAwarded}/{item.maxPoints} pts
          </Badge>
        )}
      </div>

      <p className="mt-3 text-sm font-medium text-foreground">
        {item.question}
      </p>
      <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap text-foreground">
        {item.answerText?.trim() || (
          <span className="text-muted-foreground italic">No answer given</span>
        )}
      </div>
      {item.explanation && (
        <p className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">Explanation (shown to learners): </span>
          {item.explanation}
        </p>
      )}

      {editing ? (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              Points (out of {item.maxPoints})
            </div>
            {item.maxPoints <= MAX_POINT_BUTTONS ? (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: item.maxPoints + 1 }, (_, n) => (
                  <Button
                    key={n}
                    type="button"
                    size="sm"
                    variant={points === n ? "default" : "outline"}
                    onClick={() => setPoints(n)}
                    aria-pressed={points === n}
                  >
                    {n}
                  </Button>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min={0}
                max={item.maxPoints}
                value={points ?? ""}
                onChange={(e) =>
                  setPoints(
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                className="w-24 rounded-md border border-input bg-background px-2 py-1 text-sm"
                aria-label={`Points out of ${item.maxPoints}`}
              />
            )}
          </div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Note to the learner (optional)
            </span>
            <textarea
              rows={2}
              maxLength={2000}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What was good, and what was missing"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={save}
              disabled={
                saving ||
                points === null ||
                !Number.isInteger(points) ||
                points < 0 ||
                points > item.maxPoints
              }
            >
              {saving && <Loader2 className="size-3.5 animate-spin" />}
              Save grade
            </Button>
            {graded && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-start justify-between gap-2 border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">
            {item.feedback ? (
              <>
                <span className="font-medium text-foreground">Note: </span>
                {item.feedback}
              </>
            ) : (
              "No note."
            )}
            {item.reviewedAt && (
              <span className="ml-2 text-xs">
                · {new Date(item.reviewedAt).toLocaleString()}
              </span>
            )}
          </p>
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Regrade
          </Button>
        </div>
      )}
    </div>
  )
}
