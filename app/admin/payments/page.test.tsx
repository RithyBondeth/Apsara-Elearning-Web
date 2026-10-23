import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type {
  IAdminPayment,
  IAdminPaymentDetail,
} from "@/utils/interfaces/admin/api.interface"

const calls: Record<string, string | undefined>[] = []
const refundCalls: { id: string; body: { amount?: number; reason: string } }[] =
  []
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
          note: null,
          requestedByName: null,
          createdAt: "2026-09-05T00:00:00Z",
        },
      ],
    }),
  refundPayment: (id: string, body: { amount?: number; reason: string }) => {
    refundCalls.push({ id, body })
    const base = rows.find((r) => r.id === id)!
    return Promise.resolve({
      refundStatus: "succeeded",
      subscriptionCanceled: body.amount === undefined,
      payment: {
        ...base,
        refundedAmount: base.amount,
        refundStatus: "refunded",
        refunds: [],
      },
    })
  },
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
/* ConfirmDialog's own Cancel label comes from next-intl. */
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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
  refundCalls.length = 0
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

  it("refunds what is left, warning that a full refund ends the subscription", async () => {
    rows = [payment({ refundStatus: "partially_refunded", refundedAmount: 2 })]
    render(<PaymentsPage />)
    await userEvent.click(await screen.findByText("Sok Dara"))

    const amount = await screen.findByDisplayValue("3.00")
    expect(amount).toBeInTheDocument()
    expect(
      screen.getByText(/full refund also ends this learner/i)
    ).toBeInTheDocument()

    const refund = screen.getByRole("button", { name: "Refund…" })
    expect(refund).toBeDisabled()
    await userEvent.type(
      screen.getByPlaceholderText("Charged twice by mistake"),
      "Charged twice"
    )
    await userEvent.click(refund)
    await userEvent.click(await screen.findByRole("button", { name: "Refund" }))

    await waitFor(() => expect(refundCalls).toHaveLength(1))
    /* Full refund: no amount, so the server refunds exactly what's left. */
    expect(refundCalls[0]).toEqual({
      id: "p1",
      body: { amount: undefined, reason: "Charged twice" },
    })
  })

  it("sends a partial amount and refuses more than what is left", async () => {
    rows = [payment({ refundStatus: "partially_refunded", refundedAmount: 2 })]
    render(<PaymentsPage />)
    await userEvent.click(await screen.findByText("Sok Dara"))
    const amount = await screen.findByDisplayValue("3.00")
    await userEvent.type(
      screen.getByPlaceholderText("Charged twice by mistake"),
      "Goodwill credit"
    )

    await userEvent.clear(amount)
    await userEvent.type(amount, "3.50")
    expect(screen.getByRole("button", { name: "Refund…" })).toBeDisabled()

    await userEvent.clear(amount)
    await userEvent.type(amount, "1.25")
    expect(
      screen.queryByText(/full refund also ends this learner/i)
    ).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: "Refund…" }))
    await userEvent.click(await screen.findByRole("button", { name: "Refund" }))

    await waitFor(() =>
      expect(refundCalls[0]?.body).toEqual({
        amount: 1.25,
        reason: "Goodwill credit",
      })
    )
  })
})
