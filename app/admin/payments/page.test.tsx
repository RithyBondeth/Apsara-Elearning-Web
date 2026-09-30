import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type {
  IAdminPayment,
  IAdminPaymentDetail,
} from "@/utils/interfaces/admin/api.interface"

const calls: Record<string, string | undefined>[] = []
let rows: IAdminPayment[] = []
let params = new URLSearchParams()

vi.mock("next/navigation", () => ({ useSearchParams: () => params }))
vi.mock("@/lib/api/admin", () => ({
  listPayments: (p: Record<string, string | undefined>) => {
    calls.push(p)
    return Promise.resolve(rows)
  },
  getPayment: (id: string): Promise<IAdminPaymentDetail> =>
    Promise.resolve({
      ...rows.find((r) => r.id === id)!,
      refunds: [
        {
          id: "r1",
          amount: 2,
          currency: "usd",
          status: "succeeded",
          reason: "requested_by_customer",
          failureReason: null,
          providerRefundId: "re_1",
          createdAt: "2026-09-05T00:00:00Z",
        },
      ],
    }),
}))

import PaymentsPage from "./page"

const payment = (over: Partial<IAdminPayment>): IAdminPayment => ({
  id: "p1",
  userId: "u1",
  learnerName: "Sok Dara",
  learnerEmail: "dara@example.com",
  planName: "Premium Monthly",
  amount: 5,
  currency: "USD",
  provider: "stripe",
  status: "succeeded",
  refundedAmount: 0,
  refundStatus: null,
  transactionId: "in_1",
  providerInvoiceId: "in_1",
  createdAt: "2026-09-01T00:00:00Z",
  ...over,
})

beforeEach(() => {
  calls.length = 0
  params = new URLSearchParams()
})

describe("admin PaymentsPage", () => {
  it("lists payments with learner, plan, amount and refund state", async () => {
    rows = [
      payment({}),
      payment({
        id: "p2",
        userId: null,
        learnerName: null,
        learnerEmail: null,
        refundStatus: "partially_refunded",
        refundedAmount: 2,
      }),
    ]
    render(<PaymentsPage />)

    expect(await screen.findByText("Sok Dara")).toBeInTheDocument()
    expect(screen.getByText("Deleted account")).toBeInTheDocument()
    expect(screen.getAllByText("Premium Monthly")).toHaveLength(2)
    expect(screen.getByText(/refunded \$2\.00/)).toBeInTheDocument()
  })

  it("filters and searches through the API", async () => {
    rows = []
    render(<PaymentsPage />)
    await waitFor(() => expect(calls).toHaveLength(1))

    await userEvent.click(screen.getByRole("button", { name: "Refunded" }))
    await waitFor(() =>
      expect(calls.at(-1)).toMatchObject({ filter: "refunded" })
    )

    await userEvent.type(
      screen.getByPlaceholderText("Search learner, email or transaction id"),
      "dara"
    )
    await waitFor(() =>
      expect(calls.at(-1)).toMatchObject({ q: "dara", filter: "refunded" })
    )
  })

  it("scopes to one learner when opened from the Users page", async () => {
    params = new URLSearchParams({ userId: "u1", name: "Sok Dara" })
    rows = []
    render(<PaymentsPage />)
    expect(await screen.findByText("Payments by Sok Dara")).toBeInTheDocument()
    await waitFor(() => expect(calls[0]).toMatchObject({ userId: "u1" }))
  })

  it("opens a payment's refund history", async () => {
    rows = [payment({ refundStatus: "partially_refunded", refundedAmount: 2 })]
    render(<PaymentsPage />)
    await userEvent.click(await screen.findByText("Sok Dara"))

    expect(await screen.findByText("Refunds")).toBeInTheDocument()
    expect(screen.getByText(/requested by customer/)).toBeInTheDocument()
  })
})
