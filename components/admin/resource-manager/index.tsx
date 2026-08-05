"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { Loader2, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { ResourceDialog } from "@/components/admin/resource-dialog"
import type { IAdminField, TFormValues } from "@/components/admin/form-field"
import { ApiError } from "@/lib/api/client"
import { singularize } from "@/utils/functions/format"

export interface IAdminColumn<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  className?: string
}

/**
 * List + create + edit + delete for one resource.
 *
 * The five taxonomies, badges and plans are the same screen with a different
 * field schema, so they share this rather than existing as seven near-identical
 * pages. Anything with nested children (courses, lessons, quizzes) has its own
 * page instead — the shape stops being a flat table there.
 */
export function ResourceManager<T extends { id: string }>({
  title,
  description,
  fields,
  columns,
  load,
  create,
  update,
  remove,
  toValues,
  createDefaults = {},
  labelOf,
  rowAction,
  reloadKey,
}: {
  title: string
  description?: string
  fields: IAdminField[]
  columns: IAdminColumn<T>[]
  load: () => Promise<T[]>
  create: (body: Record<string, unknown>) => Promise<unknown>
  update: (id: string, body: Record<string, unknown>) => Promise<unknown>
  remove: (id: string) => Promise<unknown>
  /** Maps an existing row back into form values for the edit dialog. */
  toValues: (row: T) => TFormValues
  createDefaults?: TFormValues
  /** Human label for this row, used in the delete confirmation. */
  labelOf: (row: T) => string
  rowAction?: (row: T) => ReactNode
  /** Change this to force a refetch — e.g. when the parent's scope changes. */
  reloadKey?: unknown
}) {
  const [rows, setRows] = useState<T[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)

  /* `load` is held in a ref so callers can pass an inline arrow — a changing
     function identity in the dependency array would re-fetch on every render
     and never settle. Refetching is driven by `nonce` (after a mutation) and
     `reloadKey` (when the parent's scope changes) instead. */
  const [nonce, setNonce] = useState(0)
  const loadRef = useRef(load)
  useEffect(() => {
    loadRef.current = load
  })

  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    loadRef.current().then(
      (data) => {
        if (cancelled) return
        setRows(data)
        setFailed(false)
      },
      () => {
        if (cancelled) return
        setRows([])
        setFailed(true)
      }
    )
    return () => {
      cancelled = true
    }
  }, [nonce, reloadKey])

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (row: T) => {
    setEditing(row)
    setDialogOpen(true)
  }

  async function submit(payload: Record<string, unknown>) {
    if (editing) {
      await update(editing.id, payload)
      toast.success(`${singularize(title)} updated`)
    } else {
      await create(payload)
      toast.success(`${singularize(title)} created`)
    }
    refresh()
  }

  async function destroy(row: T) {
    try {
      await remove(row.id)
      toast.success(`Deleted ${labelOf(row)}`)
      refresh()
    } catch (err) {
      /* Most deletes fail because something still references the row — the
         gateway says which, so show it rather than a generic message. */
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus className="size-4" />
          New
        </Button>
      </div>

      {rows === null ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading…
        </div>
      ) : failed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load {title.toLowerCase()}.
          <button onClick={refresh} className="ml-1 font-medium underline">
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          Nothing here yet. Create the first one.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((c) => (
                  <TableHead key={c.key} className={c.className}>
                    {c.label}
                  </TableHead>
                ))}
                <TableHead className="w-px text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((c) => (
                    <TableCell key={c.key} className={c.className}>
                      {c.render
                        ? c.render(row)
                        : String(
                            (row as Record<string, unknown>)[c.key] ?? "—"
                          )}
                    </TableCell>
                  ))}
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {rowAction?.(row)}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(row)}
                        aria-label={`Edit ${labelOf(row)}`}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete ${labelOf(row)}?`}
                        description="This cannot be undone. Content that still references it will be rejected by the server."
                        confirmLabel="Delete"
                        variant="danger"
                        icon={<Trash2 className="size-4.5" />}
                        onConfirm={() => destroy(row)}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${labelOf(row)}`}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </ConfirmDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ResourceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={
          editing ? `Edit ${labelOf(editing)}` : `New ${singularize(title)}`
        }
        fields={fields}
        initialValues={editing ? toValues(editing) : createDefaults}
        submitLabel={editing ? "Save changes" : "Create"}
        onSubmit={submit}
      />
    </div>
  )
}
