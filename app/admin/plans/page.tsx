"use client"

import { Badge } from "@/components/ui/badge"
import { ResourceManager } from "@/components/admin/resource-manager"
import type { IAdminField } from "@/components/admin/form-field"
import {
  createPlan,
  deletePlan,
  listPlans,
  updatePlan,
} from "@/lib/api/admin"
import {
  BILLING_PERIODS,
  ENTITLEMENTS,
  type IAdminPlan,
} from "@/utils/interfaces/admin/api.interface"

const PLAN_FIELDS: IAdminField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    required: true,
    placeholder: "premium-monthly",
  },
  { name: "description", label: "Description", type: "textarea", rows: 3 },
  {
    name: "price",
    label: "Price",
    type: "number",
    required: true,
    min: 0,
    help: "In the plan's currency, up to 2 decimal places. Use 0 for a free tier.",
  },
  {
    name: "billingPeriod",
    label: "Billing period",
    type: "select",
    options: BILLING_PERIODS.map((p) => ({
      value: p,
      label: p.charAt(0).toUpperCase() + p.slice(1),
    })),
  },
  {
    name: "aiCredits",
    label: "AI credits",
    type: "number",
    min: 0,
    help: "Monthly tutor allowance granted by this plan.",
  },
  {
    name: "entitlements",
    label: "Entitlements",
    type: "multiselect",
    options: ENTITLEMENTS.map((e) => ({ value: e, label: e })),
    help: "Capabilities this plan unlocks. Courses check these before serving premium content.",
  },
  {
    name: "stripePriceId",
    label: "Stripe price id",
    type: "text",
    placeholder: "price_1AbCdEf",
    help: "Must match Stripe exactly — the API rejects anything not shaped like price_….",
  },
  {
    name: "trialDays",
    label: "Trial days",
    type: "number",
    min: 0,
    max: 730,
  },
  {
    name: "gracePeriodDays",
    label: "Grace period days",
    type: "number",
    min: 0,
    max: 90,
    help: "How long access survives a failed payment.",
  },
]

export default function PlansPage() {
  return (
    <ResourceManager<IAdminPlan>
      title="Plans"
      description="Subscription tiers. Entitlements set here are what gate premium courses, the AI tutor and certificates."
      fields={PLAN_FIELDS}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        {
          key: "price",
          label: "Price",
          render: (r) => `$${Number(r.price).toFixed(2)}`,
        },
        { key: "billingPeriod", label: "Period" },
        {
          key: "entitlements",
          label: "Entitlements",
          render: (r) =>
            r.entitlements?.length ? (
              <div className="flex flex-wrap gap-1">
                {r.entitlements.map((e) => (
                  <Badge key={e} variant="secondary" className="text-[10px]">
                    {e}
                  </Badge>
                ))}
              </div>
            ) : (
              "—"
            ),
        },
      ]}
      load={listPlans}
      create={createPlan}
      update={updatePlan}
      remove={deletePlan}
      toValues={(r) => ({ ...r, entitlements: r.entitlements ?? [] })}
      createDefaults={{
        entitlements: [],
        price: 0,
        trialDays: 0,
        gracePeriodDays: 0,
      }}
      labelOf={(r) => r.name}
    />
  )
}
