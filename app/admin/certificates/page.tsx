"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  CircleCheck,
  ExternalLink,
  Loader2,
  Search,
  ShieldX,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  listCertificates,
  reinstateCertificate,
  revokeCertificate,
} from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import type { IAdminCertificate } from "@/utils/interfaces/admin/api.interface"

const REVOKE_FIELDS: IAdminField[] = [
  {
    name: "reason",
    label: "Reason",
    type: "textarea",
    required: true,
    placeholder: "Quiz answers were shared between accounts",
    help: "At least 5 characters. Shown to the learner and recorded for audit — never on the public verification page.",
  },
]

/** Waits for typing to pause before searching, so each keystroke isn't a request. */
const SEARCH_DELAY_MS = 300

export default function CertificatesPage() {
  const [query, setQuery] = useState("")
  const [certificates, setCertificates] = useState<IAdminCertificate[] | null>(
    null
  )
  const [failed, setFailed] = useState(false)
  const [filter, setFilter] = useState<"all" | "revoked">("all")
  const [revoking, setRevoking] = useState<IAdminCertificate | null>(null)

  const [nonce, setNonce] = useState(0)
  const refresh = () => setNonce((n) => n + 1)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      listCertificates(query).then(
        (rows) => {
          if (cancelled) return
          setCertificates(rows)
          setFailed(false)
        },
        () => {
          if (cancelled) return
          setCertificates([])
          setFailed(true)
        }
      )
    }, SEARCH_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, nonce])

  /* Replace one row in place so a revoke/reinstate doesn't re-run the search. */
  const replace = (updated: IAdminCertificate) =>
    setCertificates(
      (list) => list?.map((c) => (c.id === updated.id ? updated : c)) ?? null
    )

  async function reinstate(certificate: IAdminCertificate) {
    try {
      replace(await reinstateCertificate(certificate.id))
      toast.success(`${certificate.code} reinstated`)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Reinstate failed")
    }
  }

  const shown =
    filter === "revoked"
      ? certificates?.filter((c) => c.revokedAt)
      : certificates

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every certificate issued. Revoking one makes its public verification
          page say it is no longer valid, and tells the learner why. Reinstate
          undoes a revocation made in error.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, learner, email or course"
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex gap-1 text-sm">
          {(["all", "revoked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 capitalize ${
                filter === f
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {certificates === null ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading certificates…
        </div>
      ) : failed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load certificates.
          <button onClick={refresh} className="ml-1 font-medium underline">
            Retry
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Learner</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-px text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shown?.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">
                    {certificate.code}
                  </TableCell>
                  <TableCell>
                    <div className="truncate">{certificate.learnerName}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {certificate.learnerEmail}
                    </div>
                  </TableCell>
                  <TableCell>{certificate.courseTitle}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(certificate.issuedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-64">
                    {certificate.revokedAt ? (
                      <>
                        <Badge variant="destructive" className="text-[10px]">
                          revoked{" "}
                          {new Date(certificate.revokedAt).toLocaleDateString()}
                        </Badge>
                        {certificate.revocationReason && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {certificate.revocationReason}
                          </p>
                        )}
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">
                        valid
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon-sm"
                        title="Open public verification page"
                      >
                        <Link
                          href={`/verify/${certificate.code}`}
                          target="_blank"
                          aria-label={`Open verification page for ${certificate.code}`}
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      {certificate.revokedAt ? (
                        <ConfirmDialog
                          title={`Reinstate ${certificate.code}?`}
                          description={`It becomes valid again on its verification page, and ${certificate.learnerName} is told.`}
                          confirmLabel="Reinstate"
                          icon={<CircleCheck className="size-4.5" />}
                          onConfirm={() => reinstate(certificate)}
                        >
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title="Reinstate"
                            aria-label={`Reinstate ${certificate.code}`}
                          >
                            <CircleCheck className="size-4" />
                          </Button>
                        </ConfirmDialog>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Revoke"
                          aria-label={`Revoke ${certificate.code}`}
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setRevoking(certificate)}
                        >
                          <ShieldX className="size-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {shown?.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              {query.trim()
                ? `No certificates match “${query.trim()}”.`
                : filter === "revoked"
                  ? "No revoked certificates."
                  : "No certificates issued yet."}
            </div>
          )}
        </div>
      )}

      <ResourceDialog
        open={revoking !== null}
        onOpenChange={(open) => !open && setRevoking(null)}
        title={`Revoke ${revoking?.code ?? ""}?`}
        description={
          revoking
            ? `${revoking.learnerName} — ${revoking.courseTitle}. Its verification page will say it is no longer valid.`
            : undefined
        }
        fields={REVOKE_FIELDS}
        initialValues={{ reason: "" }}
        submitLabel="Revoke"
        onSubmit={async (payload) => {
          if (!revoking) return
          replace(
            await revokeCertificate(revoking.id, String(payload.reason ?? ""))
          )
          toast.success(`${revoking.code} revoked`)
        }}
      />
    </div>
  )
}
