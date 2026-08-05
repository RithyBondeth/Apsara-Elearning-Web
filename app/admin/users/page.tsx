"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  KeyRound,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import type { IAdminField } from "@/components/admin/form-field"
import {
  createGrant,
  deleteGrant,
  deleteUser,
  listGrants,
  listUsers,
  resolveEntitlements,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import {
  ENTITLEMENTS,
  type IAdminEntitlementGrant,
  type IAdminResolvedEntitlement,
  type IAdminUser,
} from "@/utils/interfaces/admin/api.interface"

const GRANT_FIELDS: IAdminField[] = [
  {
    name: "entitlement",
    label: "Entitlement",
    type: "select",
    required: true,
    options: ENTITLEMENTS.map((e) => ({ value: e, label: e })),
  },
  {
    name: "effect",
    label: "Effect",
    type: "select",
    options: [
      { value: "allow", label: "Allow" },
      { value: "deny", label: "Deny" },
    ],
    help: "Deny overrides whatever the learner's plan would otherwise grant.",
  },
  {
    name: "expiresAt",
    label: "Expires at",
    type: "text",
    placeholder: "2026-12-31T00:00:00.000Z",
    help: "ISO date-time. Leave blank for no expiry.",
  },
  {
    name: "reason",
    label: "Reason",
    type: "text",
    required: true,
    placeholder: "Scholarship — approved by …",
    help: "Recorded on the grant. Write it for whoever audits this later.",
  },
]

const fullName = (u: IAdminUser) =>
  [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email

/** Administrative grants and what the learner actually resolves to today. */
function EntitlementsDialog({
  user,
  onClose,
}: {
  user: IAdminUser
  onClose: () => void
}) {
  const [resolved, setResolved] = useState<IAdminResolvedEntitlement[] | null>(
    null
  )
  const [grants, setGrants] = useState<IAdminEntitlementGrant[]>([])
  const [granting, setGranting] = useState(false)

  const [nonce, setNonce] = useState(0)
  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    Promise.allSettled([
      resolveEntitlements(user.id),
      listGrants(user.id),
    ]).then(([r, g]) => {
      if (cancelled) return
      setResolved(r.status === "fulfilled" ? r.value : [])
      setGrants(g.status === "fulfilled" ? g.value : [])
    })
    return () => {
      cancelled = true
    }
  }, [user.id, nonce])

  async function removeGrant(id: string) {
    try {
      await deleteGrant(id)
      toast.success("Grant revoked")
      refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not revoke")
    }
  }

  return (
    <>
      <Dialog open onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Entitlements — {fullName(user)}</DialogTitle>
            <DialogDescription>{user.email}</DialogDescription>
          </DialogHeader>

          {resolved === null ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Currently resolves to</h3>
                {resolved.map((r) => (
                  <div
                    key={r.entitlement}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Badge variant={r.granted ? "default" : "ghost"}>
                      {r.granted ? "granted" : "denied"}
                    </Badge>
                    <span className="min-w-0 flex-1 truncate">
                      {r.entitlement}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      via {r.source}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Administrative grants</h3>
                  <Button size="xs" onClick={() => setGranting(true)}>
                    Add grant
                  </Button>
                </div>

                {grants.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    None — this learner resolves purely from their plan.
                  </p>
                ) : (
                  grants.map((g) => {
                    /*
                     * Revoking soft-deletes, so the endpoint keeps returning the
                     * row as an audit record. Render it plainly spent — left as
                     * an active grant it contradicts the resolution list above.
                     */
                    const revoked = Boolean(g.revokedAt)

                    return (
                      <div
                        key={g.id}
                        className={`flex items-start gap-2 rounded-xl border border-border px-3 py-2 text-sm ${
                          revoked ? "opacity-60" : ""
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                revoked
                                  ? "outline"
                                  : g.effect === "deny"
                                    ? "destructive"
                                    : "secondary"
                              }
                              className="text-[10px]"
                            >
                              {revoked ? "revoked" : g.effect}
                            </Badge>
                            <span
                              className={`truncate ${revoked ? "line-through" : ""}`}
                            >
                              {g.entitlement}
                            </span>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {g.reason}
                            {revoked
                              ? ` · revoked ${new Date(g.revokedAt!).toLocaleDateString()}`
                              : g.expiresAt &&
                                ` · until ${new Date(g.expiresAt).toLocaleDateString()}`}
                          </p>
                        </div>
                        {!revoked && (
                          <ConfirmDialog
                            title="Revoke this grant?"
                            description="The learner falls back to whatever their plan entitles them to."
                            confirmLabel="Revoke"
                            variant="danger"
                            icon={<Trash2 className="size-4.5" />}
                            onConfirm={() => removeGrant(g.id)}
                          >
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              aria-label="Revoke grant"
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </ConfirmDialog>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ResourceDialog
        open={granting}
        onOpenChange={setGranting}
        title="New grant"
        description={`Applies to ${fullName(user)}.`}
        fields={GRANT_FIELDS}
        initialValues={{ effect: "allow" }}
        submitLabel="Grant"
        onSubmit={async (payload) => {
          await createGrant(user.id, payload as never)
          toast.success("Grant created")
          refresh()
        }}
      />
    </>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<IAdminUser[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState("")
  const [entitlementsFor, setEntitlementsFor] = useState<IAdminUser | null>(null)

  const [nonce, setNonce] = useState(0)
  const refresh = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    listUsers().then(
      (data) => {
        if (cancelled) return
        setUsers(data)
        setFailed(false)
      },
      () => {
        if (cancelled) return
        setUsers([])
        setFailed(true)
      }
    )
    return () => {
      cancelled = true
    }
  }, [nonce])

  /* `GET /users` is unpaginated, so filtering happens here. That is fine while
     the user base is small; past that the fix belongs on the API. */
  const filtered = useMemo(() => {
    if (!users) return []
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        fullName(u).toLowerCase().includes(q)
    )
  }, [users, query])

  async function destroy(user: IAdminUser) {
    try {
      await deleteUser(user.id)
      toast.success(`Deleted ${fullName(user)}`)
      refresh()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed")
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone registered on the platform. Accounts are created by learners
          signing up — the console can inspect, grant entitlements and remove.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email"
          className="pl-9"
        />
      </div>

      {users === null ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading users…
        </div>
      ) : failed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load users.
          <button onClick={refresh} className="ml-1 font-medium underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Streak</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-px text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate">{fullName(user)}</span>
                      {user.isAdmin && (
                        <Badge variant="secondary" className="text-[10px]">
                          <ShieldCheck className="size-3" />
                          admin
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate">{user.email}</span>
                      {!user.isEmailVerified && (
                        <Badge variant="ghost" className="text-[10px]">
                          unverified
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.xp}</TableCell>
                  <TableCell>{user.streak}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setEntitlementsFor(user)}
                        title="Entitlements"
                        aria-label={`Entitlements for ${fullName(user)}`}
                      >
                        <KeyRound className="size-4" />
                      </Button>
                      <ConfirmDialog
                        title={`Delete ${fullName(user)}?`}
                        description="Removes the account and everything attached to it — enrolments, progress and certificates. This cannot be undone."
                        confirmLabel="Delete"
                        variant="danger"
                        icon={<Trash2 className="size-4.5" />}
                        onConfirm={() => destroy(user)}
                      >
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Delete ${fullName(user)}`}
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

          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              No users match “{query}”.
            </div>
          )}
        </div>
      )}

      {entitlementsFor && (
        <EntitlementsDialog
          user={entitlementsFor}
          onClose={() => setEntitlementsFor(null)}
        />
      )}
    </div>
  )
}
