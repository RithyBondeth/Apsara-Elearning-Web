"use client"

import { useDeferredValue } from "react"
import { LessonContent } from "@/components/learn/lesson-content"
import { MathText } from "@/components/learn/math-text"

const CONTROL =
  "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

/**
 * A Markdown textarea with a live preview drawn by the renderers learners see.
 *
 * - `document` — full lesson bodies: side by side on wide screens, via
 *   `LessonContent`, so callout boxes, formula cards and tables look exactly
 *   as they will in the reader.
 * - `inline` — one-run text such as quiz questions: a strip under the box via
 *   `MathText`, enough to catch a broken `$…$`.
 *
 * The preview reads a deferred copy of the text, so KaTeX re-typesetting a long
 * lesson never makes typing lag.
 */
export function MarkdownField({
  id,
  value,
  onChange,
  rows,
  placeholder,
  variant,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  variant: "document" | "inline"
}) {
  const preview = useDeferredValue(value)
  const empty = !preview.trim()

  if (variant === "inline") {
    return (
      <div className="space-y-1.5">
        <textarea
          id={id}
          rows={rows ?? 3}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={CONTROL}
        />
        {!empty && (
          <div
            data-testid={`${id}-preview`}
            className="rounded-xl bg-muted/50 px-3 py-2 text-sm leading-6 text-foreground"
          >
            <MathText>{preview}</MathText>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <textarea
        id={id}
        rows={rows ?? 18}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL} min-h-60 resize-y font-mono text-xs leading-5`}
      />
      <div
        data-testid={`${id}-preview`}
        aria-label="Preview"
        className="max-h-[60vh] min-h-60 overflow-y-auto rounded-xl border border-dashed border-border px-4 py-3"
      >
        <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Preview
        </p>
        {empty ? (
          <p className="text-sm text-muted-foreground">
            Nothing to preview yet. Formulas go between <code>$…$</code> (inline)
            or <code>$$…$$</code> (on their own line).
          </p>
        ) : (
          <LessonContent content={preview} />
        )}
      </div>
    </div>
  )
}
