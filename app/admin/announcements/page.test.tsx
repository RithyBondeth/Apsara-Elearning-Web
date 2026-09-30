import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type {
  IAdminAnnouncement,
  IAdminAnnouncementAudience,
} from "@/utils/interfaces/admin/api.interface"

const previews: IAdminAnnouncementAudience[] = []
const sent: unknown[] = []
let reach = 12

vi.mock("@/lib/api/admin", () => ({
  listCourses: () =>
    Promise.resolve([{ id: "c1", title: "Biology", slug: "biology" }]),
  listAnnouncements: () => Promise.resolve([]),
  previewAnnouncement: (a: IAdminAnnouncementAudience) => {
    previews.push(a)
    return Promise.resolve({ recipients: reach })
  },
  sendAnnouncement: (
    body: IAdminAnnouncementAudience & { title: string; body: string }
  ) => {
    sent.push(body)
    const created: IAdminAnnouncement = {
      ...body,
      courseId: body.courseId ?? null,
      subscribersOnly: body.subscribersOnly ?? false,
      id: "a1",
      recipientCount: reach,
      courseTitle: null,
      sentByName: "Ada Admin",
      createdAt: "2026-09-30T00:00:00Z",
    }
    return Promise.resolve(created)
  },
}))
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))

import AnnouncementsPage from "./page"

beforeEach(() => {
  previews.length = 0
  sent.length = 0
  reach = 12
})

const sendButton = () =>
  screen.getByRole("button", { name: /Send announcement/ })

describe("admin AnnouncementsPage", () => {
  it("shows the reach and only enables Send once there's a message", async () => {
    render(<AnnouncementsPage />)
    expect(await screen.findByText("Reaches 12 learners.")).toBeInTheDocument()
    expect(previews[0]).toEqual({ audience: "all", subscribersOnly: false })
    expect(sendButton()).toBeDisabled()

    await userEvent.type(screen.getByLabelText("Title"), "Maintenance")
    await userEvent.type(screen.getByLabelText("Message"), "Down 22:00–23:00")
    expect(sendButton()).toBeEnabled()
  })

  it("sends after confirmation and lists it as sent", async () => {
    render(<AnnouncementsPage />)
    await screen.findByText("Reaches 12 learners.")
    await userEvent.type(screen.getByLabelText("Title"), "Maintenance")
    await userEvent.type(screen.getByLabelText("Message"), "Down tonight")

    await userEvent.click(sendButton())
    await userEvent.click(await screen.findByRole("button", { name: "Send" }))

    await waitFor(() =>
      expect(sent).toEqual([
        {
          audience: "all",
          subscribersOnly: false,
          title: "Maintenance",
          body: "Down tonight",
        },
      ])
    )
    expect(await screen.findByText("12 learners")).toBeInTheDocument()
    expect(screen.getByLabelText("Title")).toHaveValue("")
  })

  it("won't send to an audience with no learners", async () => {
    reach = 0
    render(<AnnouncementsPage />)
    expect(
      await screen.findByText("No learners match this audience.")
    ).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText("Title"), "Hello")
    await userEvent.type(screen.getByLabelText("Message"), "Anyone?")
    expect(sendButton()).toBeDisabled()
  })

  it("re-counts when narrowing to subscribers", async () => {
    render(<AnnouncementsPage />)
    await screen.findByText("Reaches 12 learners.")
    reach = 3
    await userEvent.click(screen.getByRole("checkbox"))
    expect(await screen.findByText("Reaches 3 learners.")).toBeInTheDocument()
    expect(previews.at(-1)).toEqual({ audience: "all", subscribersOnly: true })
  })
})
