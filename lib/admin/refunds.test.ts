import { describe, expect, it } from "vitest"
import type { IAdminPaymentDetail } from "@/utils/interfaces/admin/api.interface"
import { refundableAmount } from "./refunds"

const detail = (
  amount: number,
  refunds: { amount: number; status: string }[]
): IAdminPaymentDetail =>
  ({
    amount,
    refunds: refunds.map((r, i) => ({ id: `r${i}`, ...r })),
  }) as IAdminPaymentDetail

describe("refundableAmount", () => {
  it("is what was paid minus settled and settling refunds", () => {
    expect(
      refundableAmount(
        detail(9.99, [
          { amount: 2, status: "succeeded" },
          { amount: 1.5, status: "pending" },
          { amount: 4, status: "failed" },
        ])
      )
    ).toBe(6.49)
  })

  it("never goes below zero and doesn't drift on cents", () => {
    expect(
      refundableAmount(
        detail(0.3, [
          { amount: 0.1, status: "succeeded" },
          { amount: 0.2, status: "succeeded" },
        ])
      )
    ).toBe(0)
    expect(
      refundableAmount(detail(5, [{ amount: 6, status: "succeeded" }]))
    ).toBe(0)
  })
})
