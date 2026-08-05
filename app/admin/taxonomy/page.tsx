"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResourceManager } from "@/components/admin/resource-manager"
import type { IAdminField } from "@/components/admin/form-field"
import {
  createFaculty,
  createGradeLevel,
  createMajor,
  createProgrammingCategory,
  createSubject,
  deleteFaculty,
  deleteGradeLevel,
  deleteMajor,
  deleteProgrammingCategory,
  deleteSubject,
  listFaculties,
  listGradeLevels,
  listMajors,
  listProgrammingCategories,
  listSubjects,
  updateFaculty,
  updateGradeLevel,
  updateMajor,
  updateProgrammingCategory,
  updateSubject,
} from "@/lib/api/admin"
import {
  EDUCATION_STAGES,
  type IAdminFaculty,
  type IAdminGradeLevel,
  type IAdminMajor,
  type IAdminProgrammingCategory,
  type IAdminSubject,
} from "@/utils/interfaces/admin/api.interface"

/**
 * The five taxonomies courses are placed against.
 *
 * They live on one page behind tabs because they are only ever touched
 * together — placing a course means picking a subject *and* a grade, or a
 * faculty *and* a major — and because each on its own is too small to be worth
 * a sidebar entry.
 */

const STAGE_OPTIONS = EDUCATION_STAGES.map((s) => ({
  value: s,
  label: s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}))

/* Slugs are used in student-facing URLs, so the shape is enforced here too. */
const SLUG_FIELD: IAdminField = {
  name: "slug",
  label: "Slug",
  type: "text",
  required: true,
  placeholder: "computer-science",
  help: "Lowercase, hyphenated. Appears in the public URL.",
}

const NAME_FIELDS: IAdminField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  {
    name: "nameKm",
    label: "Name (Khmer)",
    type: "text",
    placeholder: "ឈ្មោះ",
  },
]

const SUBJECT_FIELDS: IAdminField[] = [
  ...NAME_FIELDS,
  SLUG_FIELD,
  { name: "description", label: "Description", type: "textarea", rows: 3 },
  {
    name: "descriptionKm",
    label: "Description (Khmer)",
    type: "textarea",
    rows: 3,
  },
  {
    name: "icon",
    label: "Icon",
    type: "text",
    placeholder: "calculator",
    help: "Lucide icon slug.",
  },
]

const GRADE_FIELDS: IAdminField[] = [
  {
    name: "stage",
    label: "Stage",
    type: "select",
    required: true,
    options: STAGE_OPTIONS,
  },
  {
    name: "grade",
    label: "Grade",
    type: "number",
    required: true,
    min: 1,
    max: 12,
  },
  ...NAME_FIELDS,
  { name: "order", label: "Order", type: "number", min: 0 },
]

const FACULTY_FIELDS: IAdminField[] = [
  ...NAME_FIELDS,
  SLUG_FIELD,
  { name: "description", label: "Description", type: "textarea", rows: 3 },
  { name: "icon", label: "Icon", type: "text", help: "Lucide icon slug." },
]

const CATEGORY_FIELDS: IAdminField[] = [
  ...NAME_FIELDS,
  SLUG_FIELD,
  { name: "description", label: "Description", type: "textarea", rows: 3 },
  {
    name: "descriptionKm",
    label: "Description (Khmer)",
    type: "textarea",
    rows: 3,
  },
  { name: "icon", label: "Icon", type: "text", help: "Lucide icon slug." },
]

export default function TaxonomyPage() {
  /* Majors belong to a faculty, so that tab needs the faculty list as options.
     Loaded once here rather than inside the field schema, which is static. */
  const [faculties, setFaculties] = useState<IAdminFaculty[]>([])

  useEffect(() => {
    listFaculties()
      .then(setFaculties)
      .catch(() => setFaculties([]))
  }, [])

  const majorFields: IAdminField[] = [
    ...NAME_FIELDS,
    SLUG_FIELD,
    {
      name: "facultyId",
      label: "Faculty",
      type: "select",
      options: faculties.map((f) => ({ value: f.id, label: f.name })),
      help: faculties.length ? undefined : "Create a faculty first.",
    },
    { name: "description", label: "Description", type: "textarea", rows: 3 },
  ]

  const facultyName = (id?: string) =>
    faculties.find((f) => f.id === id)?.name ?? "—"

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Taxonomy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The structures courses are placed against — K–12 subjects and grades,
          university faculties and majors, and programming categories.
        </p>
      </div>

      <Tabs defaultValue="subjects">
        <TabsList className="flex-wrap">
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="grades">Grade levels</TabsTrigger>
          <TabsTrigger value="faculties">Faculties</TabsTrigger>
          <TabsTrigger value="majors">Majors</TabsTrigger>
          <TabsTrigger value="categories">Programming</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="pt-5">
          <ResourceManager<IAdminSubject>
            title="Subjects"
            description="K–12 subjects, e.g. Mathematics or Khmer Literature."
            fields={SUBJECT_FIELDS}
            columns={[
              { key: "name", label: "Name" },
              { key: "nameKm", label: "Khmer" },
              { key: "slug", label: "Slug" },
            ]}
            load={listSubjects}
            create={createSubject}
            update={updateSubject}
            remove={deleteSubject}
            toValues={(r) => ({ ...r })}
            labelOf={(r) => r.name}
          />
        </TabsContent>

        <TabsContent value="grades" className="pt-5">
          <ResourceManager<IAdminGradeLevel>
            title="Grade levels"
            description="Grades 1–12, grouped by education stage."
            fields={GRADE_FIELDS}
            columns={[
              { key: "grade", label: "Grade" },
              { key: "name", label: "Name" },
              { key: "nameKm", label: "Khmer" },
              {
                key: "stage",
                label: "Stage",
                render: (r) => r.stage.replace(/_/g, " "),
              },
            ]}
            load={listGradeLevels}
            create={createGradeLevel}
            update={updateGradeLevel}
            remove={deleteGradeLevel}
            toValues={(r) => ({ ...r })}
            labelOf={(r) => r.name}
          />
        </TabsContent>

        <TabsContent value="faculties" className="pt-5">
          <ResourceManager<IAdminFaculty>
            title="Faculties"
            description="University faculties. Majors hang off these."
            fields={FACULTY_FIELDS}
            columns={[
              { key: "name", label: "Name" },
              { key: "nameKm", label: "Khmer" },
              { key: "slug", label: "Slug" },
            ]}
            load={listFaculties}
            create={async (body) => {
              const created = await createFaculty(body)
              setFaculties(await listFaculties())
              return created
            }}
            update={updateFaculty}
            remove={async (id) => {
              const res = await deleteFaculty(id)
              setFaculties(await listFaculties())
              return res
            }}
            toValues={(r) => ({ ...r })}
            labelOf={(r) => r.name}
          />
        </TabsContent>

        <TabsContent value="majors" className="pt-5">
          <ResourceManager<IAdminMajor>
            title="Majors"
            description="Degree programmes, each belonging to a faculty."
            fields={majorFields}
            columns={[
              { key: "name", label: "Name" },
              { key: "slug", label: "Slug" },
              {
                key: "facultyId",
                label: "Faculty",
                render: (r) => facultyName(r.facultyId),
              },
            ]}
            load={listMajors}
            create={createMajor}
            update={updateMajor}
            remove={deleteMajor}
            toValues={(r) => ({ ...r })}
            labelOf={(r) => r.name}
            reloadKey={faculties.length}
          />
        </TabsContent>

        <TabsContent value="categories" className="pt-5">
          <ResourceManager<IAdminProgrammingCategory>
            title="Programming categories"
            description="Tracks for the programming courses, e.g. Web or Mobile."
            fields={CATEGORY_FIELDS}
            columns={[
              { key: "name", label: "Name" },
              { key: "nameKm", label: "Khmer" },
              { key: "slug", label: "Slug" },
            ]}
            load={listProgrammingCategories}
            create={createProgrammingCategory}
            update={updateProgrammingCategory}
            remove={deleteProgrammingCategory}
            toValues={(r) => ({ ...r })}
            labelOf={(r) => r.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
