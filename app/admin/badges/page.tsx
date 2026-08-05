"use client"

import { useEffect, useState } from "react"
import { Award, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ResourceManager } from "@/components/admin/resource-manager"
import type { IAdminField } from "@/components/admin/form-field"
import {
  awardBadge,
  revokeBadge,
  createBadge,
  deleteBadge,
  listBadges,
  listUsers,
  updateBadge,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import type {
  IAdminBadge,
  IAdminUser,
} from "@/utils/interfaces/admin/api.interface"

const BADGE_FIELDS: IAdminField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", rows: 3 },
  {
    name: "icon",
    label: "Icon",
    type: "text",
    placeholder: "trophy",
    help: "Lucide icon slug — rendered on the learner's achievements grid.",
  },
  {
    name: "xpRequired",
    label: "XP required",
    type: "number",
    min: 0,
    help: "Awarded automatically once a learner passes this XP. Use 0 for badges you only grant by hand.",
  },
]

const nameOf = (u: IAdminUser) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email

/** Manual grant, for badges outside the XP ladder. */
function AwardDialog({ badge }: { badge: IAdminBadge }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  /* Learners are picked from a list rather than typed: ids are uuids and the
     Users page shows no id to copy, so a raw field had nothing to fill it. */
  const [learners, setLearners] = useState<IAdminUser[] | null>(null)
  const [query, setQuery] = useState("")
  const [picked, setPicked] = useState<IAdminUser | null>(null)

  /* Deferred to first open — this dialog is mounted once per badge row. */
  useEffect(() => {
    if (!open || learners) return
    listUsers().then(setLearners, () => setLearners([]))
  }, [open, learners])

  const matches = (learners ?? []).filter((u) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      nameOf(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    )
  })

  function reset() {
    setOpen(false)
    setPicked(null)
    setQuery("")
  }

  async function award() {
    if (!picked) {
      toast.error("Pick a learner first")
      return
    }
    setBusy(true)
    try {
      const result = await awardBadge(badge.id, picked.id)
      toast.success(
        result.alreadyOwned
          ? `${nameOf(picked)} already has this badge`
          : `Awarded ${badge.name} to ${nameOf(picked)}`
      )
      reset()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not award")
    } finally {
      setBusy(false)
    }
  }

  async function revoke() {
    if (!picked) {
      toast.error("Pick a learner first")
      return
    }
    setBusy(true)
    try {
      await revokeBadge(badge.id, picked.id)
      toast.success(`Revoked ${badge.name} from ${nameOf(picked)}`)
      reset()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not revoke")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(true)}
        aria-label={`Award ${badge.name}`}
        title="Award to a learner"
      >
        <Award className="size-4" />
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => (next ? setOpen(true) : reset())}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Award “{badge.name}”</DialogTitle>
            <DialogDescription>
              Grants the badge outright, ignoring the XP requirement, or takes
              it back again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 py-2">
            <label htmlFor="award-user" className="text-sm font-medium">
              Learner
            </label>
            <Input
              id="award-user"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPicked(null)
              }}
              placeholder="Search by name or email…"
              autoComplete="off"
            />

            <div
              role="listbox"
              aria-label="Learners"
              className="max-h-56 overflow-y-auto rounded-xl border border-border"
            >
              {learners === null ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  Loading learners…
                </p>
              ) : matches.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">
                  No learner matches “{query.trim()}”.
                </p>
              ) : (
                matches.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    role="option"
                    aria-selected={picked?.id === u.id}
                    onClick={() => setPicked(u)}
                    className={`flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60 ${
                      picked?.id === u.id ? "bg-muted" : ""
                    }`}
                  >
                    <span className="font-medium text-foreground">
                      {nameOf(u)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {u.email}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <Button
              variant="ghost"
              onClick={revoke}
              disabled={busy || !picked}
              className="text-muted-foreground hover:text-destructive"
            >
              Revoke
            </Button>
            <div className="flex items-center gap-2.5">
              <Button variant="outline" onClick={reset} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={award} disabled={busy || !picked}>
                {busy && <Loader2 className="size-4 animate-spin" />}
                Award
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function BadgesPage() {
  return (
    <ResourceManager<IAdminBadge>
      title="Badges"
      description="Achievements shown on the learner dashboard. XP badges are awarded automatically as learners earn XP."
      fields={BADGE_FIELDS}
      columns={[
        { key: "name", label: "Name" },
        { key: "icon", label: "Icon" },
        { key: "xpRequired", label: "XP" },
        {
          key: "description",
          label: "Description",
          className: "max-w-sm truncate",
        },
      ]}
      load={listBadges}
      create={createBadge}
      update={updateBadge}
      remove={deleteBadge}
      toValues={(r) => ({ ...r })}
      createDefaults={{ xpRequired: 0 }}
      labelOf={(r) => r.name}
      rowAction={(row) => <AwardDialog badge={row} />}
    />
  )
}
