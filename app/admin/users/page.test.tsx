import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { IAdminUser } from "@/utils/interfaces/admin/api.interface"

const updateUser = vi.fn()
let users: IAdminUser[] = []

vi.mock("@/lib/api/admin", () => ({
  listUsers: () => Promise.resolve(users),
  updateUser: (...args: unknown[]) => {
    updateUser(...args)
    return Promise.resolve({})
  },
  deleteUser: vi.fn(),
  listGrants: () => Promise.resolve([]),
  resolveEntitlements: () => Promise.resolve([]),
  createGrant: vi.fn(),
  deleteGrant: vi.fn(),
}))
vi.mock("@/lib/api/user", () => ({
  getMe: () => Promise.resolve({ id: "me" }),
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))

import UsersPage from "./page"

const user = (over: Partial<IAdminUser>): IAdminUser => ({
  id: "u",
  firstName: "Learner",
  lastName: "One",
  streak: 0,
  xp: 0,
  isAdmin: false,
  suspendedAt: null,
  email: "u@example.com",
  isEmailVerified: true,
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
  ...over,
})

const row = (name: string) => screen.getByText(name).closest("tr")!

beforeEach(() => updateUser.mockClear())

describe("admin UsersPage", () => {
  it("hides demote, suspend and delete on the signed-in admin's own row", async () => {
    users = [
      user({ id: "me", firstName: "Me", lastName: "Admin", isAdmin: true }),
    ]
    render(<UsersPage />)

    await screen.findByText("you")
    const mine = within(row("Me Admin"))
    expect(mine.getByRole("button", { name: /Edit name/ })).toBeInTheDocument()
    expect(
      mine.queryByRole("button", { name: /Remove admin/ })
    ).not.toBeInTheDocument()
    expect(
      mine.queryByRole("button", { name: /Suspend/ })
    ).not.toBeInTheDocument()
    expect(
      mine.queryByRole("button", { name: /Delete/ })
    ).not.toBeInTheDocument()
  })

  it("promotes a learner after confirmation", async () => {
    users = [user({ id: "u1", firstName: "Sok", lastName: "Dara" })]
    render(<UsersPage />)

    await userEvent.click(
      await screen.findByRole("button", { name: "Make Sok Dara an admin" })
    )
    await userEvent.click(
      await screen.findByRole("button", { name: "Make admin" })
    )
    expect(updateUser).toHaveBeenCalledWith("u1", { isAdmin: true })
  })

  it("marks a suspended account and offers to reinstate it", async () => {
    users = [
      user({
        id: "u2",
        firstName: "Chan",
        lastName: "Bopha",
        suspendedAt: "2026-09-20T00:00:00Z",
      }),
    ]
    render(<UsersPage />)

    expect(await screen.findByText("suspended")).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole("button", { name: "Reinstate Chan Bopha" })
    )
    await userEvent.click(
      await screen.findByRole("button", { name: "Reinstate" })
    )
    expect(updateUser).toHaveBeenCalledWith("u2", { suspended: false })
  })

  it("suspends an active learner after confirmation", async () => {
    users = [user({ id: "u3", firstName: "Vannak", lastName: "Kim" })]
    render(<UsersPage />)

    await userEvent.click(
      await screen.findByRole("button", { name: "Suspend Vannak Kim" })
    )
    await userEvent.click(
      await screen.findByRole("button", { name: "Suspend" })
    )
    expect(updateUser).toHaveBeenCalledWith("u3", { suspended: true })
  })
})
