"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, RotateCcw, Search, TriangleAlert, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getPayment, listPayments, refundPayment } from "@/lib/api/admin"
import { ApiError } from "@/lib/api/client"
import { refundableAmount } from "@/lib/admin/refunds"
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

/**
 * Refund part or all of a payment through Stripe. A full refund also ends the
 * subscription it paid for (when it covers the current period), so the
 * confirmation says so before anything is sent.
 */
function RefundForm({
  detail,
  onRefunded,
}: {
  detail: IAdminPaymentDetail
  onRefunded: (updated: IAdminPaymentDetail) => void
}) {
  const remaining = refundableAmount(detail)
  const [amount, setAmount] = useState(remaining.toFixed(2))
  const [reason, setReason] = useState("")
  const [saving, setSaving] = useState(false)

  const value = Number(amount)
  const validAmount =
    /^\d+(\.\d{1,2})?$/.test(amount.trim()) &&
    value >= 0.01 &&
    value <= remaining
  const validReason = reason.trim().length >= 5
  const full =
    validAmount && Math.round(value * 100) === Math.round(remaining * 100)

  async function submit() {
    setSaving(true)
    try {
      const result = await refundPayment(detail.id, {
        /* Omit for a full refund so the server refunds exactly what's left. */
        amount: full ? undefined : value,
        reason: reason.trim(),
      })
      toast.success(
        result.refundStatus === "failed"
          ? "Stripe declined the refund — see the refund list"
          : `Refunded ${money(value, detail.currency)}${
              result.subscriptionCanceled ? " · subscription ended" : ""
            }${result.refundStatus === "pending" ? " · pending at the bank" : ""}`
      )
      setReason("")
      onRefunded(result.payment)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Refund failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border p-3">
      <h3 className="font-medium">Refund</h3>
      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Amount (max {money(remaining, detail.currency)})
          </span>
          <Input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={!validAmount}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-muted-foreground">
            Reason (kept for audit)
          </span>
          <Input
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Charged twice by mistake"
          />
        </label>
      </div>
      {full && detail.planName && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          A full refund also ends this learner&apos;s subscription now, if this
          payment covers the current period.
        </p>
      )}
      <ConfirmDialog
        title={`Refund ${validAmount ? money(value, detail.currency) : ""}?`}
        description={
          full
            ? `The money goes back to ${detail.learnerName ?? "the payer"} through Stripe, and the subscription this paid for ends immediately. This can't be undone.`
            : `The money goes back to ${detail.learnerName ?? "the payer"} through Stripe. This can't be undone.`
        }
        confirmLabel="Refund"
        variant="danger"
        icon={<RotateCcw className="size-4.5" />}
        onConfirm={() => void submit()}
      >
        <Button
          size="sm"
          variant="destructive"
          disabled={!validAmount || !validReason || saving}
        >
          {saving && <Loader2 className="size-3.5 animate-spin" />}
          Refund…
        </Button>
      </ConfirmDialog>
    </div>
  )
}

function PaymentDialog({
  id,
  onClose,
  onChanged,
}: {
  id: string
  onClose: () => void
  onChanged: (updated: IAdminPayment) => void
}) {
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
                        {r.requestedByName
                          ? ` · by ${r.requestedByName}`
                          : r.reason && ` · ${r.reason.replace(/_/g, " ")}`}
                        {r.failureReason && ` · ${r.failureReason}`}
                      </p>
                      {r.note && (
                        <p className="text-xs text-foreground">{r.note}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {detail.status === "succeeded" &&
              detail.provider === "stripe" &&
              refundableAmount(detail) > 0 && (
                <RefundForm
                  detail={detail}
                  onRefunded={(updated) => {
                    setDetail(updated)
                    onChanged(updated)
                  }}
                />
              )}
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
          Every payment recorded from Stripe, newest first, with refunds. Open a
          payment to refund part or all of it; a full refund also ends the
          subscription it paid for. Refunds made in the Stripe dashboard appear
          here too. Payments by deleted accounts are kept, without a learner.
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

      {openId && (
        <PaymentDialog
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={(updated) =>
            setPayments(
              (list) =>
                list?.map((p) =>
                  p.id === updated.id ? { ...p, ...updated } : p
                ) ?? null
            )
          }
        />
      )}
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
