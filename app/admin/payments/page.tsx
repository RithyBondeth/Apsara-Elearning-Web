"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Search, TriangleAlert, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPayment, listPayments } from "@/lib/api/admin"
import type {
  IAdminPayment,
  IAdminPaymentDetail,
  TAdminPaymentFilter,
} from "@/utils/interfaces/admin/api.interface"

/** Waits for typing to pause before searching. */
const SEARCH_DELAY_MS = 300

const FILTERS: { key: TAdminPaymentFilter | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "succeeded", label: "Succeeded" },
  { key: "failed", label: "Failed" },
  { key: "refunded", label: "Refunded" },
]

/** Amounts are stored in major units with an ISO currency code. */
function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

function StatusBadge({ payment }: { payment: IAdminPayment }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge
        variant={payment.status === "succeeded" ? "secondary" : "destructive"}
        className="text-[10px]"
      >
        {payment.status || "unknown"}
      </Badge>
      {payment.refundStatus && (
        <Badge variant="outline" className="text-[10px]">
          {payment.refundStatus === "refunded"
            ? "refunded"
            : `refunded ${money(payment.refundedAmount, payment.currency)}`}
        </Badge>
      )}
    </div>
  )
}

function PaymentDialog({ id, onClose }: { id: string; onClose: () => void }) {
  const [detail, setDetail] = useState<IAdminPaymentDetail | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPayment(id).then(
      (d) => !cancelled && setDetail(d),
      () => !cancelled && setFailed(true)
    )
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>
            {detail
              ? `${money(detail.amount, detail.currency)} · ${new Date(detail.createdAt).toLocaleString()}`
              : "Loading…"}
          </DialogDescription>
        </DialogHeader>

        {failed ? (
          <p className="text-sm text-destructive">
            Could not load this payment.
          </p>
        ) : !detail ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-5 py-1 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-muted-foreground">Learner</dt>
              <dd className="min-w-0 truncate">
                {detail.learnerName
                  ? `${detail.learnerName} (${detail.learnerEmail})`
                  : "Deleted account"}
              </dd>
              <dt className="text-muted-foreground">Plan</dt>
              <dd>{detail.planName ?? "—"}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <StatusBadge payment={detail} />
              </dd>
              <dt className="text-muted-foreground">Provider</dt>
              <dd>{detail.provider}</dd>
              <dt className="text-muted-foreground">Transaction</dt>
              <dd className="min-w-0 font-mono text-xs break-all">
                {detail.transactionId ?? "—"}
              </dd>
              {detail.providerInvoiceId &&
                detail.providerInvoiceId !== detail.transactionId && (
                  <>
                    <dt className="text-muted-foreground">Invoice</dt>
                    <dd className="min-w-0 font-mono text-xs break-all">
                      {detail.providerInvoiceId}
                    </dd>
                  </>
                )}
            </dl>

            <div className="space-y-2">
              <h3 className="font-medium">Refunds</h3>
              {detail.refunds.length === 0 ? (
                <p className="text-muted-foreground">None.</p>
              ) : (
                <ul className="divide-y divide-border rounded-xl border border-border">
                  {detail.refunds.map((r) => (
                    <li key={r.id} className="space-y-0.5 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {money(r.amount, r.currency.toUpperCase())}
                        </span>
                        <Badge
                          variant={
                            r.status === "succeeded" ? "secondary" : "outline"
                          }
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString()}
                        {r.reason && ` · ${r.reason.replace(/_/g, " ")}`}
                        {r.failureReason && ` · ${r.failureReason}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function PaymentsInner() {
  const params = useSearchParams()
  /* Set by the Users page's per-learner shortcut. */
  const userId = params.get("userId") ?? undefined
  const userName = params.get("name")

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<TAdminPaymentFilter | "all">("all")
  const [payments, setPayments] = useState<IAdminPayment[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      listPayments({
        q: query,
        filter: filter === "all" ? undefined : filter,
        userId,
      }).then(
        (rows) => {
          if (cancelled) return
          setPayments(rows)
          setFailed(false)
        },
        () => {
          if (cancelled) return
          setPayments([])
          setFailed(true)
        }
      )
    }, SEARCH_DELAY_MS)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, filter, userId])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every payment recorded from Stripe, newest first, with refunds.
          Read-only — refunds are issued in Stripe and appear here once Stripe
          reports them. Payments by deleted accounts are kept, without a
          learner.
        </p>
      </div>

      {userId && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">
            Payments by {userName ?? "one learner"}
          </Badge>
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" /> Show everyone
          </Link>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search learner, email or transaction id"
            className="pl-9"
          />
        </div>
        <div className="ml-auto flex gap-1 text-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1 ${
                filter === f.key
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {payments === null ? (
        <div className="flex items-center gap-2 py-12 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading payments…
        </div>
      ) : failed ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <TriangleAlert className="size-4 shrink-0" />
          Could not load payments.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Learner</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setOpenId(p.id)}
                >
                  <TableCell className="whitespace-nowrap">
                    <button
                      type="button"
                      className="text-left hover:underline"
                      aria-label={`Payment details from ${new Date(p.createdAt).toLocaleDateString()}`}
                    >
                      {new Date(p.createdAt).toLocaleDateString()}
                    </button>
                  </TableCell>
                  <TableCell>
                    {p.learnerName ? (
                      <>
                        <div className="truncate">{p.learnerName}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {p.learnerEmail}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        Deleted account
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{p.planName ?? "—"}</TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {money(p.amount, p.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge payment={p} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {payments.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-foreground">
              {query.trim()
                ? `No payments match “${query.trim()}”.`
                : "No payments yet."}
            </div>
          )}
        </div>
      )}

      {openId && <PaymentDialog id={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsInner />
    </Suspense>
  )
}
