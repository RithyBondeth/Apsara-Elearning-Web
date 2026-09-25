"use client"

import { ResourceManager } from "@/components/admin/resource-manager"
import type { IAdminField } from "@/components/admin/form-field"
import {
  createTestimonial,
  deleteTestimonial,
  listTestimonials,
  updateTestimonial,
} from "@/lib/api/admin"
import { AVATAR_PRESETS } from "@/utils/constants/avatar.constant"
import type { IAdminTestimonial } from "@/utils/interfaces/admin/api.interface"

const FIELDS: IAdminField[] = [
  { name: "name", label: "Name", type: "text", required: true, placeholder: "Sophea K." },
  {
    name: "role",
    label: "Role",
    type: "text",
    required: true,
    placeholder: "Grade 12 Chemistry teacher, Phnom Penh",
    help: "Shown under the quote so visitors know who is speaking.",
  },
  { name: "roleKm", label: "Role (Khmer)", type: "text" },
  { name: "quote", label: "Quote", type: "textarea", rows: 4, required: true },
  { name: "quoteKm", label: "Quote (Khmer)", type: "textarea", rows: 4 },
  {
    name: "avatar",
    label: "Avatar",
    type: "select",
    options: AVATAR_PRESETS.map((a) => ({ value: a, label: a })),
  },
  {
    name: "consentSource",
    label: "Consent — how",
    type: "text",
    required: true,
    placeholder: "Signed consent form, Grade 12 pilot",
    help: "Required. How this person agreed to be quoted publicly. Only add real people who gave permission.",
  },
  {
    name: "consentedAt",
    label: "Consent — date",
    type: "text",
    required: true,
    placeholder: "2026-09-20",
    help: "Required. YYYY-MM-DD, not in the future.",
  },
  {
    name: "published",
    label: "Published",
    type: "switch",
    help: "Shown on the landing page's learner reviews section.",
  },
]

export default function TestimonialsPage() {
  return (
    <ResourceManager<IAdminTestimonial>
      title="Testimonials"
      description="Quotes from real teachers, beta testers and partners — each with a record of how and when they agreed to be quoted. Published quotes appear on the landing page next to featured course reviews."
      fields={FIELDS}
      columns={[
        { key: "name", label: "Name" },
        { key: "role", label: "Role", className: "max-w-[14rem] truncate" },
        { key: "quote", label: "Quote", className: "max-w-sm truncate" },
        {
          key: "consent",
          label: "Consent",
          render: (r) => `${r.consentSource} · ${r.consentedAt}`,
          className: "max-w-[14rem] truncate text-muted-foreground",
        },
        { key: "published", label: "Published", render: (r) => (r.published ? "Yes" : "No") },
      ]}
      load={listTestimonials}
      create={createTestimonial}
      update={updateTestimonial}
      remove={deleteTestimonial}
      toValues={(r) => ({
        name: r.name,
        role: r.role,
        roleKm: r.roleKm ?? "",
        quote: r.quote,
        quoteKm: r.quoteKm ?? "",
        avatar: r.avatar ?? "",
        consentSource: r.consentSource,
        consentedAt: r.consentedAt,
        published: r.published,
      })}
      createDefaults={{ published: false, avatar: "star" }}
      labelOf={(r) => r.name}
    />
  )
}
