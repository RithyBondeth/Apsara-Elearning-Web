import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { IAdminCertificate } from "@/utils/interfaces/admin/api.interface"

const listCalls: (string | undefined)[] = []
const revoke = vi.fn()
const reinstate = vi.fn()
let rows: IAdminCertificate[] = []

vi.mock("@/lib/api/admin", () => ({
  listCertificates: (q?: string) => {
    listCalls.push(q)
    return Promise.resolve(rows)
  },
  revokeCertificate: (id: string, reason: string) => {
    revoke(id, reason)
    return Promise.resolve({
      ...rows.find((r) => r.id === id)!,
      revokedAt: "2026-09-29T00:00:00Z",
      revocationReason: reason,
    })
  },
  reinstateCertificate: (id: string) => {
    reinstate(id)
    return Promise.resolve({
      ...rows.find((r) => r.id === id)!,
      revokedAt: null,
      revocationReason: null,
    })
  },
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

import CertificatesPage from "./page"

const cert = (over: Partial<IAdminCertificate>): IAdminCertificate => ({
  id: "c1",
  code: "APS-4K7M-QW2X-9BTF",
  userId: "u1",
  learnerName: "Sok Dara",
  learnerEmail: "dara@example.com",
  courseId: "course-1",
  courseTitle: "Grade 12 Chemistry",
  issuedAt: "2026-08-04T00:00:00Z",
  revokedAt: null,
  revocationReason: null,
  revokedBy: null,
  ...over,
})

beforeEach(() => {
  listCalls.length = 0
  revoke.mockClear()
  reinstate.mockClear()
})

describe("admin CertificatesPage", () => {
  it("revokes with a reason and shows it in the row", async () => {
    rows = [cert({})]
    render(<CertificatesPage />)

    await userEvent.click(
      await screen.findByRole("button", { name: "Revoke APS-4K7M-QW2X-9BTF" })
    )
    await userEvent.type(
      await screen.findByPlaceholderText(/shared between accounts/),
      "Issued to the wrong account"
    )
    await userEvent.click(screen.getByRole("button", { name: "Revoke" }))

    expect(revoke).toHaveBeenCalledWith("c1", "Issued to the wrong account")
    expect(
      await screen.findByText("Issued to the wrong account")
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Reinstate APS-4K7M-QW2X-9BTF" })
    ).toBeInTheDocument()
  })

  it("reinstates a revoked certificate after confirmation", async () => {
    rows = [
      cert({ revokedAt: "2026-09-20T00:00:00Z", revocationReason: "Mistake" }),
    ]
    render(<CertificatesPage />)

    await userEvent.click(
      await screen.findByRole("button", {
        name: "Reinstate APS-4K7M-QW2X-9BTF",
      })
    )
    await userEvent.click(
      await screen.findByRole("button", { name: "Reinstate" })
    )

    expect(reinstate).toHaveBeenCalledWith("c1")
    const row = (await screen.findByText("valid")).closest("tr")!
    expect(within(row).queryByText("Mistake")).not.toBeInTheDocument()
  })

  it("searches after typing pauses, not on every keystroke", async () => {
    rows = []
    render(<CertificatesPage />)
    await waitFor(() => expect(listCalls).toEqual([""]))

    await userEvent.type(
      screen.getByPlaceholderText("Search code, learner, email or course"),
      "dara"
    )
    await waitFor(() => expect(listCalls.at(-1)).toBe("dara"))
    expect(listCalls).toHaveLength(2)
  })

  it("filters to revoked certificates", async () => {
    rows = [
      cert({ id: "c1", code: "APS-AAAA-AAAA-AAAA" }),
      cert({
        id: "c2",
        code: "APS-BBBB-BBBB-BBBB",
        revokedAt: "2026-09-20T00:00:00Z",
      }),
    ]
    render(<CertificatesPage />)
    await screen.findByText("APS-AAAA-AAAA-AAAA")

    await userEvent.click(screen.getByRole("button", { name: "revoked" }))

    expect(screen.queryByText("APS-AAAA-AAAA-AAAA")).not.toBeInTheDocument()
    expect(screen.getByText("APS-BBBB-BBBB-BBBB")).toBeInTheDocument()
  })
})
