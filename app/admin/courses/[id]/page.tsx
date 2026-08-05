"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  Video,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { ResourceDialog } from "@/components/admin/resource-dialog"
import type { IAdminField, TFormValues } from "@/components/admin/form-field"
import {
  createLesson,
  createModule,
  deleteLesson,
  deleteModule,
  getCourse,
  listLessons,
  listModules,
  reorderLessons,
  reorderModules,
  updateLesson,
  updateModule,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { pluralize } from "@/utils/functions/format"
import {
  LESSON_TYPES,
  type IAdminCourse,
  type IAdminLesson,
  type IAdminModule,
} from "@/utils/interfaces/admin/api.interface"

const MODULE_FIELDS: IAdminField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", rows: 3 },
]

const LESSON_FIELDS: IAdminField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "solving-quadratics",
    help: "Lowercase, hyphenated. Appears in the lesson URL.",
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    options: LESSON_TYPES.map((t) => ({
      value: t,
      label: t.charAt(0).toUpperCase() + t.slice(1),
    })),
  },
  {
    name: "videoUrl",
    label: "Video URL",
    type: "text",
    placeholder: "https://www.youtube.com/watch?v=…",
    help: "YouTube and Vimeo share links are rewritten to their embed form.",
    visible: (v) => v.type === "video",
  },
  {
    name: "content",
    label: "Content",
    type: "textarea",
    rows: 12,
    help: "Markdown. Indented formulas render as formula cards in the reader.",
  },
  {
    name: "estimatedMinutes",
    label: "Estimated minutes",
    type: "number",
    min: 0,
  },
]

const LESSON_ICON = {
  video: Video,
  article: FileText,
  interactive: ClipboardList,
} as const

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>()
  const courseId = params.id

  const [course, setCourse] = useState<IAdminCourse | null>(null)
  const [modules, setModules] = useState<IAdminModule[] | null>(null)
  const [lessons, setLessons] = useState<Record<string, IAdminLesson[]>>({})
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [failed, setFailed] = useState(false)

  const [moduleDialog, setModuleDialog] = useState(false)
  const [editingModule, setEditingModule] = useState<IAdminModule | null>(null)
  const [lessonDialog, setLessonDialog] = useState(false)
  const [lessonTarget, setLessonTarget] = useState<{
    moduleId: string
    lesson: IAdminLesson | null
  } | null>(null)

  /**
   * Loads the whole tree.
   *
   * This is 1 + N requests — one per module. The public catalog has
   * `/course/:id/structure` for exactly this, but it refuses unpublished
   * courses and strips gated lesson bodies, which is the opposite of what an
   * author needs. Module counts per course are small enough that the walk is
   * fine here; if it stops being fine, the fix is an admin structure endpoint,
   * not a client-side cache.
   */
  const [nonce, setNonce] = useState(0)
  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchTree() {
      try {
        const [courseData, moduleData] = await Promise.all([
          getCourse(courseId),
          listModules(courseId),
        ])
        if (cancelled) return
        setCourse(courseData)
        setModules(moduleData)
        setFailed(false)

        const lists = await Promise.all(
          moduleData.map((m) =>
            listLessons(m.id).then(
              (l) => [m.id, l] as const,
              () => [m.id, [] as IAdminLesson[]] as const
            )
          )
        )
        if (cancelled) return
        setLessons(Object.fromEntries(lists))
      } catch {
        if (cancelled) return
        setFailed(true)
        setModules([])
      }
    }

    fetchTree()
    return () => {
      cancelled = true
    }
  }, [courseId, nonce])

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  /* Reorder sends the full id list in its new order, so the server never has to
     infer intent from a single moved index. */
  async function moveModule(index: number, delta: number) {
    if (!modules) return
    const target = index + delta
    if (target < 0 || target >= modules.length) return

    const next = [...modules]
    ;[next[index], next[target]] = [next[target], next[index]]
    setModules(next)

    try {
      await reorderModules(
        courseId,
        next.map((m) => m.id)
      )
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reorder failed")
      refresh()
    }
  }

  async function moveLesson(moduleId: string, index: number, delta: number) {
    const list = lessons[moduleId]
    if (!list) return
    const target = index + delta
    if (target < 0 || target >= list.length) return

    const next = [...list]
    ;[next[index], next[target]] = [next[target], next[index]]
    setLessons((prev) => ({ ...prev, [moduleId]: next }))

    try {
      await reorderLessons(
        moduleId,
        next.map((l) => l.id)
      )
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reorder failed")
      refresh()
    }
  }

  async function submitModule(payload: Record<string, unknown>) {
    if (editingModule) {
      await updateModule(courseId, editingModule.id, payload)
      toast.success("Module updated")
    } else {
      await createModule(courseId, payload)
      toast.success("Module created")
    }
    refresh()
  }

  async function submitLesson(payload: Record<string, unknown>) {
    if (!lessonTarget) return
    const { moduleId, lesson } = lessonTarget
    if (lesson) {
      await updateLesson(moduleId, lesson.id, payload)
      toast.success("Lesson updated")
    } else {
      await createLesson(moduleId, payload)
      toast.success("Lesson created")
    }
    refresh()
  }

  async function removeModule(m: IAdminModule) {
    try {
      await deleteModule(courseId, m.id)
      toast.success(`Deleted ${m.title}`)
      refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  async function removeLesson(moduleId: string, l: IAdminLesson) {
    try {
      await deleteLesson(moduleId, l.id)
      toast.success(`Deleted ${l.title}`)
      refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  if (modules === null) {
    return (
      <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Loading course…
      </div>
    )
  }

  if (failed) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/courses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Courses
        </Link>
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load this course.
          <button onClick={refresh} className="ml-1 font-medium underline">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Courses
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl font-semibold text-foreground">
              {course?.title}
            </h1>
            <Badge variant={course?.published ? "default" : "ghost"}>
              {course?.published ? "Published" : "Draft"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {pluralize(modules.length, "module")} ·{" "}
            {pluralize(
              Object.values(lessons).reduce((n, l) => n + l.length, 0),
              "lesson",
            )}
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingModule(null)
            setModuleDialog(true)
          }}
        >
          <Plus className="size-4" />
          New module
        </Button>
      </div>

      {modules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
          No modules yet. Add the first one to start building this course.
        </div>
      ) : (
        <div className="space-y-2.5">
          {modules.map((module, moduleIndex) => {
            const isOpen = expanded.has(module.id)
            const moduleLessons = lessons[module.id] ?? []

            return (
              <div
                key={module.id}
                className="overflow-hidden rounded-xl border border-border"
              >
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2.5">
                  <button
                    onClick={() => toggle(module.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    aria-expanded={isOpen}
                  >
                    {isOpen ? (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate text-sm font-medium text-foreground">
                      {module.title}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {pluralize(moduleLessons.length, "lesson")}
                    </span>
                  </button>

                  <div className="flex shrink-0 items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => moveModule(moduleIndex, -1)}
                      disabled={moduleIndex === 0}
                      aria-label="Move module up"
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => moveModule(moduleIndex, 1)}
                      disabled={moduleIndex === modules.length - 1}
                      aria-label="Move module down"
                    >
                      ↓
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setEditingModule(module)
                        setModuleDialog(true)
                      }}
                      aria-label={`Edit ${module.title}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ConfirmDialog
                      title={`Delete ${module.title}?`}
                      description="Its lessons go with it. This cannot be undone."
                      confirmLabel="Delete"
                      variant="danger"
                      icon={<Trash2 className="size-4.5" />}
                      onConfirm={() => removeModule(module)}
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${module.title}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </ConfirmDialog>
                  </div>
                </div>

                {isOpen && (
                  <div className="divide-y divide-border border-t border-border">
                    {moduleLessons.map((lesson, lessonIndex) => {
                      const Icon =
                        LESSON_ICON[lesson.type ?? "article"] ?? FileText
                      return (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-2 px-3 py-2 pl-9"
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                            {lesson.title}
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                            {lesson.slug}
                          </span>

                          <div className="flex shrink-0 items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                moveLesson(module.id, lessonIndex, -1)
                              }
                              disabled={lessonIndex === 0}
                              aria-label="Move lesson up"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                moveLesson(module.id, lessonIndex, 1)
                              }
                              disabled={
                                lessonIndex === moduleLessons.length - 1
                              }
                              aria-label="Move lesson down"
                            >
                              ↓
                            </Button>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon-sm"
                              title="Quizzes and challenges"
                              aria-label={`Assessments for ${lesson.title}`}
                            >
                              <Link
                                /* moduleId rides along so the assessments page
                                   can name its lesson in one request — lessons
                                   are only addressable under their module. */
                                href={`/admin/courses/${courseId}/lessons/${lesson.id}?moduleId=${module.id}`}
                              >
                                <ClipboardList className="size-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => {
                                setLessonTarget({ moduleId: module.id, lesson })
                                setLessonDialog(true)
                              }}
                              aria-label={`Edit ${lesson.title}`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <ConfirmDialog
                              title={`Delete ${lesson.title}?`}
                              description="This cannot be undone. Learner progress on this lesson goes with it."
                              confirmLabel="Delete"
                              variant="danger"
                              icon={<Trash2 className="size-4.5" />}
                              onConfirm={() => removeLesson(module.id, lesson)}
                            >
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Delete ${lesson.title}`}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </ConfirmDialog>
                          </div>
                        </div>
                      )
                    })}

                    <div className="px-3 py-2 pl-9">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLessonTarget({
                            moduleId: module.id,
                            lesson: null,
                          })
                          setLessonDialog(true)
                        }}
                        className="text-muted-foreground"
                      >
                        <Plus className="size-4" />
                        Add lesson
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ResourceDialog
        open={moduleDialog}
        onOpenChange={setModuleDialog}
        title={editingModule ? `Edit ${editingModule.title}` : "New module"}
        fields={MODULE_FIELDS}
        initialValues={
          editingModule ? ({ ...editingModule } as TFormValues) : {}
        }
        submitLabel={editingModule ? "Save changes" : "Create"}
        onSubmit={submitModule}
      />

      <ResourceDialog
        open={lessonDialog}
        onOpenChange={setLessonDialog}
        title={
          lessonTarget?.lesson
            ? `Edit ${lessonTarget.lesson.title}`
            : "New lesson"
        }
        fields={LESSON_FIELDS}
        initialValues={
          lessonTarget?.lesson
            ? ({ ...lessonTarget.lesson } as TFormValues)
            : { type: "article" }
        }
        submitLabel={lessonTarget?.lesson ? "Save changes" : "Create"}
        onSubmit={submitLesson}
      />
    </div>
  )
}
