"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  AdminFormField,
  buildPayload,
  validateFields,
  type IAdminField,
  type TFormValues,
} from "@/components/admin/form-field"
import { ApiError } from "@/lib/api/client"

/**
 * One create/edit form, shared by every admin screen.
 *
 * The API is the validator of record — this only mirrors `@IsNotEmpty` so the
 * obvious mistakes never round-trip. Anything the gateway rejects is surfaced
 * verbatim, because its messages name the offending field.
 */
export function ResourceDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initialValues,
  submitLabel = "Save",
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: IAdminField[]
  initialValues: TFormValues
  submitLabel?: string
  /** Resolves with the built payload; throw to keep the dialog open. */
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
}) {
  const [values, setValues] = useState<TFormValues>(initialValues)
  const [busy, setBusy] = useState(false)
  const [wasOpen, setWasOpen] = useState(open)

  /* Re-seed whenever the dialog opens, so editing row B never shows row A's
     values and a create form always starts clean.

     Done during render rather than in an effect: an effect would paint the
     stale values for one frame first, and this component stays mounted between
     rows so there is no remount to reset it. */
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setValues(initialValues)
  }

  const change = (name: string, value: unknown) =>
    setValues((v) => ({ ...v, [name]: value }))

  async function submit() {
    const problem = validateFields(fields, values)
    if (problem) {
      toast.error(problem)
      return
    }

    setBusy(true)
    try {
      await onSubmit(buildPayload(fields, values))
      onOpenChange(false)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Something went wrong"
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fields.map((field) => (
            <AdminFormField
              key={field.name}
              field={field}
              values={values}
              onChange={change}
            />
          ))}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
