"use client"

import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Form values are heterogeneous by nature; each field coerces its own slot. */
export type TFormValues = Record<string, unknown>

export interface IFieldOption {
  value: string
  label: string
}

export interface IAdminField {
  name: string
  label: string
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "switch"
    | "multiselect"
    /** Free-form JSON object — edited as text, sent parsed. */
    | "json"
  required?: boolean
  placeholder?: string
  /** Shown under the control — use it for format rules the API enforces. */
  help?: string
  options?: IFieldOption[]
  min?: number
  max?: number
  /** Monospace + taller box, for code and content bodies. */
  mono?: boolean
  rows?: number
  /** Conditional fields, e.g. course placement depends on programType. */
  visible?: (values: TFormValues) => boolean
}

/* ── Payload building ─────────────────────────────────────────────────── */

const isBlank = (v: unknown) => v === undefined || v === null || v === ""

/**
 * Turns form state into a request body.
 *
 * Blank optional fields are **omitted rather than sent as `""`** — the gateway
 * validates with `forbidNonWhitelisted` and most optional strings carry
 * `@IsNotEmpty`, so an empty string is a 400 where an absent key is fine.
 *
 * Fields hidden by `visible` are dropped too: a course switched from `k12` to
 * `university` must not keep posting its old `subjectId`.
 */
export function buildPayload(
  fields: IAdminField[],
  values: TFormValues
): Record<string, unknown> {
  const payload: Record<string, unknown> = {}

  for (const field of fields) {
    if (field.visible && !field.visible(values)) continue

    const raw = values[field.name]

    if (field.type === "switch") {
      payload[field.name] = Boolean(raw)
      continue
    }

    if (field.type === "multiselect") {
      payload[field.name] = Array.isArray(raw) ? raw : []
      continue
    }

    if (isBlank(raw)) continue

    if (field.type === "json") {
      /* Already proven parseable by validateFields, which runs first. */
      try {
        payload[field.name] = JSON.parse(String(raw))
      } catch {
        continue
      }
      continue
    }

    if (field.type === "number") {
      const n = Number(raw)
      /* Let the field stay absent rather than posting NaN. */
      if (Number.isNaN(n)) continue
      payload[field.name] = n
      continue
    }

    payload[field.name] = raw
  }

  return payload
}

/**
 * Mirrors the validation the API would apply, so the obvious mistakes never
 * round-trip. Returns a ready-to-show message, or null when the form is clean.
 */
export function validateFields(
  fields: IAdminField[],
  values: TFormValues
): string | null {
  for (const field of fields) {
    if (field.visible && !field.visible(values)) continue

    const raw = values[field.name]

    if (field.required && isBlank(raw)) return `${field.label} is required`

    /* An unparseable object would be dropped silently by buildPayload, so it
       has to be caught while the author can still see what they typed. */
    if (field.type === "json" && !isBlank(raw)) {
      try {
        const parsed = JSON.parse(String(raw))
        if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
          return `${field.label} must be a JSON object`
        }
      } catch {
        return `${field.label} is not valid JSON`
      }
    }
  }
  return null
}

/* ── Rendering ────────────────────────────────────────────────────────── */

const CONTROL =
  "w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function AdminFormField({
  field,
  values,
  onChange,
}: {
  field: IAdminField
  values: TFormValues
  onChange: (name: string, value: unknown) => void
}) {
  if (field.visible && !field.visible(values)) return null

  const value = values[field.name]

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={`field-${field.name}`}
        className="text-sm font-medium text-foreground"
      >
        {field.label}
        {field.required && <span className="ml-0.5 text-destructive">*</span>}
      </label>

      {(field.type === "textarea" || field.type === "json") && (
        <textarea
          id={`field-${field.name}`}
          rows={field.rows ?? 5}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
          className={`${CONTROL} ${field.mono || field.type === "json" ? "font-mono text-xs" : ""}`}
        />
      )}

      {(field.type === "text" || field.type === "number") && (
        <Input
          id={`field-${field.name}`}
          type={field.type === "number" ? "number" : "text"}
          min={field.min}
          max={field.max}
          value={(value as string | number) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(field.name, e.target.value)}
        />
      )}

      {field.type === "select" && (
        <Select
          value={(value as string) || undefined}
          onValueChange={(v) => onChange(field.name, v)}
        >
          <SelectTrigger id={`field-${field.name}`} className="w-full">
            <SelectValue placeholder={field.placeholder ?? "Select…"} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "switch" && (
        <div className="flex items-center gap-2.5 pt-1">
          <Switch
            id={`field-${field.name}`}
            checked={Boolean(value)}
            onCheckedChange={(c) => onChange(field.name, c)}
          />
          <span className="text-sm text-muted-foreground">
            {value ? "Yes" : "No"}
          </span>
        </div>
      )}

      {field.type === "multiselect" && (
        <div className="space-y-2 pt-1">
          {field.options?.map((o) => {
            const selected = Array.isArray(value)
              ? (value as string[]).includes(o.value)
              : false
            return (
              <label
                key={o.value}
                className="flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground"
              >
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value)
                      ? [...(value as string[])]
                      : []
                    onChange(
                      field.name,
                      checked
                        ? [...current, o.value]
                        : current.filter((v) => v !== o.value)
                    )
                  }}
                />
                {o.label}
              </label>
            )
          })}
        </div>
      )}

      {field.help && (
        <p className="text-xs text-muted-foreground">{field.help}</p>
      )}
    </div>
  )
}
