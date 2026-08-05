"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { SquarePen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ResourceManager } from "@/components/admin/resource-manager"
import { pluralize } from "@/utils/functions/format"
import type { IAdminField, TFormValues } from "@/components/admin/form-field"
import {
  createCourse,
  deleteCourse,
  listCourses,
  listGradeLevels,
  listMajors,
  listProgrammingCategories,
  listSubjects,
  updateCourse,
} from "@/lib/api/admin"
import {
  COURSE_DIFFICULTIES,
  ENTITLEMENTS,
  PROGRAM_TYPES,
  type IAdminCourse,
  type IAdminGradeLevel,
  type IAdminMajor,
  type IAdminProgrammingCategory,
  type IAdminSubject,
} from "@/utils/interfaces/admin/api.interface"

const PROGRAM_LABELS: Record<string, string> = {
  k12: "K–12",
  university: "University",
  programming: "Programming",
}

export default function CoursesPage() {
  /* Placement options come from the taxonomy, so the form needs all four lists.
     Fetched once here; the field schema below is rebuilt when they arrive. */
  const [subjects, setSubjects] = useState<IAdminSubject[]>([])
  const [grades, setGrades] = useState<IAdminGradeLevel[]>([])
  const [majors, setMajors] = useState<IAdminMajor[]>([])
  const [categories, setCategories] = useState<IAdminProgrammingCategory[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.allSettled([
      listSubjects(),
      listGradeLevels(),
      listMajors(),
      listProgrammingCategories(),
    ]).then(([s, g, m, c]) => {
      if (s.status === "fulfilled") setSubjects(s.value)
      if (g.status === "fulfilled") setGrades(g.value)
      if (m.status === "fulfilled") setMajors(m.value)
      if (c.status === "fulfilled") setCategories(c.value)
      setReady(true)
    })
  }, [])

  /* A course is placed by exactly one taxonomy, chosen by programType. Showing
     all four at once invites sending a subjectId on a university course, which
     the API accepts and the catalog then can't file anywhere. */
  const isProgram = (type: string) => (values: TFormValues) =>
    values.programType === type

  const fields: IAdminField[] = [
    {
      name: "programType",
      label: "Program",
      type: "select",
      required: true,
      options: PROGRAM_TYPES.map((p) => ({
        value: p,
        label: PROGRAM_LABELS[p],
      })),
      help: "Decides where the course appears in the catalog, and which placement below applies.",
    },
    { name: "title", label: "Title", type: "text", required: true },
    { name: "titleKm", label: "Title (Khmer)", type: "text" },
    {
      name: "slug",
      label: "Slug",
      type: "text",
      required: true,
      placeholder: "grade-12-mathematics",
      help: "Lowercase, hyphenated. Appears in the public URL.",
    },
    {
      name: "subjectId",
      label: "Subject",
      type: "select",
      options: subjects.map((s) => ({ value: s.id, label: s.name })),
      visible: isProgram("k12"),
      required: true,
    },
    {
      name: "gradeLevelId",
      label: "Grade level",
      type: "select",
      options: grades.map((g) => ({ value: g.id, label: g.name })),
      visible: isProgram("k12"),
      required: true,
    },
    {
      name: "majorId",
      label: "Major",
      type: "select",
      options: majors.map((m) => ({ value: m.id, label: m.name })),
      visible: isProgram("university"),
      required: true,
    },
    {
      name: "categoryId",
      label: "Category",
      type: "select",
      options: categories.map((c) => ({ value: c.id, label: c.name })),
      visible: isProgram("programming"),
      required: true,
    },
    { name: "description", label: "Description", type: "textarea", rows: 4 },
    {
      name: "descriptionKm",
      label: "Description (Khmer)",
      type: "textarea",
      rows: 4,
    },
    {
      name: "thumbnail",
      label: "Thumbnail URL",
      type: "text",
      placeholder: "https://…",
    },
    {
      name: "difficulty",
      label: "Difficulty",
      type: "select",
      options: COURSE_DIFFICULTIES.map((d) => ({
        value: d,
        label: d.charAt(0).toUpperCase() + d.slice(1),
      })),
    },
    { name: "estimatedHours", label: "Estimated hours", type: "number", min: 0 },
    {
      name: "published",
      label: "Published",
      type: "switch",
      help: "Unpublished courses are hidden from the catalog and return 404 to students.",
    },
    {
      name: "requiresSubscription",
      label: "Requires subscription",
      type: "switch",
      help: "Lesson bodies are stripped for learners without the entitlement below.",
    },
    {
      name: "requiredEntitlement",
      label: "Required entitlement",
      type: "select",
      options: ENTITLEMENTS.map((e) => ({ value: e, label: e })),
      visible: (v) => Boolean(v.requiresSubscription),
    },
  ]

  return (
    <ResourceManager<IAdminCourse>
      title="Courses"
      description="Create a course here, then open it to build its modules and lessons."
      fields={fields}
      columns={[
        { key: "title", label: "Title" },
        {
          key: "programType",
          label: "Program",
          render: (r) =>
            r.programType ? PROGRAM_LABELS[r.programType] : "—",
        },
        { key: "slug", label: "Slug" },
        {
          key: "counts",
          label: "Content",
          render: (r) =>
            `${pluralize(r.moduleCount ?? 0, "module")} · ${pluralize(
              r.lessonCount ?? 0,
              "lesson",
            )}`,
        },
        {
          key: "published",
          label: "Status",
          render: (r) => (
            <Badge variant={r.published ? "default" : "ghost"}>
              {r.published ? "Published" : "Draft"}
            </Badge>
          ),
        },
      ]}
      load={listCourses}
      create={createCourse}
      update={updateCourse}
      remove={deleteCourse}
      toValues={(r) => ({ ...r })}
      createDefaults={{
        programType: "k12",
        published: false,
        requiresSubscription: false,
      }}
      labelOf={(r) => r.title}
      reloadKey={ready}
      rowAction={(row) => (
        <Button
          asChild
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit content of ${row.title}`}
          title="Modules and lessons"
        >
          <Link href={`/admin/courses/${row.id}`}>
            <SquarePen className="size-4" />
          </Link>
        </Button>
      )}
    />
  )
}
