import type { IAdminPaymentDetail } from "@/utils/interfaces/admin/api.interface"

/** Refunds that already claim part of a payment, settled or still settling. */
const COMMITTED_REFUND_STATUSES = new Set([
  "succeeded",
  "pending",
  "requires_action",
])

/** What can still be refunded, in major units, to the cent. */
export function refundableAmount(detail: IAdminPaymentDetail): number {
  const committed = detail.refunds
    .filter((r) => COMMITTED_REFUND_STATUSES.has(r.status))
    .reduce((sum, r) => sum + Math.round(r.amount * 100), 0)
  return Math.max(0, Math.round(detail.amount * 100) - committed) / 100
}
