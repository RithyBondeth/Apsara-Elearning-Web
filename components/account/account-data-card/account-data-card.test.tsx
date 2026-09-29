import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError } from "@/lib/api/client"

const signOut = vi.fn()
const requested: string[] = []
let deletion: () => Promise<{ deleteAfter: string }> = () =>
  new Promise(() => {})
let exported: () => Promise<Record<string, unknown>> = () =>
  Promise.resolve({ profile: {} })

vi.mock("@/lib/api/account", () => ({
  requestAccountDeletion: (password: string) => {
    requested.push(password)
    return deletion()
  },
  exportMyData: () => exported(),
}))
vi.mock("@/hooks/utils/use-sign-out", () => ({ useSignOut: () => signOut }))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { AccountDataCard } from "."

beforeEach(() => {
  signOut.mockClear()
  requested.length = 0
})

async function openAndSubmit(password: string) {
  await userEvent.click(screen.getByRole("button", { name: /deleteAccount/ }))
  await userEvent.type(
    await screen.findByLabelText("deletePasswordLabel"),
    password
  )
  await userEvent.click(screen.getByRole("button", { name: /deleteConfirm/ }))
}

describe("AccountDataCard", () => {
  it("won't submit a deletion without a password", async () => {
    render(<AccountDataCard />)
    await userEvent.click(screen.getByRole("button", { name: /deleteAccount/ }))
    expect(
      await screen.findByRole("button", { name: /deleteConfirm/ })
    ).toBeDisabled()
  })

  it("signs out to the login page with the deletion date", async () => {
    deletion = () =>
      Promise.resolve({ deleteAfter: "2026-10-06T09:00:00.000Z" })
    render(<AccountDataCard />)

    await openAndSubmit("my-password")

    await waitFor(() =>
      expect(signOut).toHaveBeenCalledWith(
        "/login?deletion=2026-10-06T09%3A00%3A00.000Z"
      )
    )
    expect(requested).toEqual(["my-password"])
  })

  it("keeps the dialog open and flags a wrong password", async () => {
    deletion = () => Promise.reject(new ApiError(401, "Password is incorrect"))
    render(<AccountDataCard />)

    await openAndSubmit("nope")

    expect(await screen.findByText("deletePasswordWrong")).toBeInTheDocument()
    expect(signOut).not.toHaveBeenCalled()
  })

  it("downloads the export as a JSON file", async () => {
    exported = () => Promise.resolve({ profile: { email: "a@b.com" } })
    const createObjectURL = vi.fn((blob: Blob) => (blob ? "blob:export" : ""))
    const revokeObjectURL = vi.fn()
    Object.assign(URL, { createObjectURL, revokeObjectURL })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    render(<AccountDataCard />)
    await userEvent.click(screen.getByRole("button", { name: /downloadData/ }))

    await waitFor(() => expect(click).toHaveBeenCalled())
    const blob = createObjectURL.mock.calls[0][0]
    expect(JSON.parse(await blob.text())).toEqual({
      profile: { email: "a@b.com" },
    })
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:export")
    click.mockRestore()
  })
})
