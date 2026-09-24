import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { NotificationItem } from "@/components/utils/notification-bell/notification-item"
import type { IApiNotification } from "@/utils/interfaces/notification/api.interface"

function notification(over: Partial<IApiNotification> = {}): IApiNotification {
  return {
    id: "n1",
    type: "badge_awarded",
    title: "Badge earned: First Steps",
    body: "You crossed 100 XP.",
    data: { badgeId: "b1" },
    readAt: null,
    createdAt: new Date().toISOString(),
    ...over,
  }
}

describe("NotificationItem", () => {
  it("renders the title and body", () => {
    const { getByText } = render(
      <NotificationItem notification={notification()} />
    )
    expect(getByText("Badge earned: First Steps")).toBeInTheDocument()
    expect(getByText("You crossed 100 XP.")).toBeInTheDocument()
  })

  it("renders without a body", () => {
    const { getByText } = render(
      <NotificationItem notification={notification({ body: null })} />
    )
    expect(getByText("Badge earned: First Steps")).toBeInTheDocument()
  })

  it("marks an unread row and styles it as unread", () => {
    const { getByTestId } = render(
      <NotificationItem notification={notification({ readAt: null })} />
    )
    expect(getByTestId("notification-item").dataset.unread).toBe("true")
  })

  it("does not style a read row as unread", () => {
    const { getByTestId } = render(
      <NotificationItem
        notification={notification({ readAt: new Date().toISOString() })}
      />
    )
    expect(getByTestId("notification-item").dataset.unread).toBe("false")
  })

  it("calls onRead when an unread row is clicked", async () => {
    const onRead = vi.fn()
    const { getByTestId } = render(
      <NotificationItem notification={notification()} onRead={onRead} />
    )
    await userEvent.click(getByTestId("notification-item"))
    expect(onRead).toHaveBeenCalledWith("n1")
  })

  it("does not call onRead again for an already-read row", async () => {
    const onRead = vi.fn()
    const { getByTestId } = render(
      <NotificationItem
        notification={notification({ readAt: new Date().toISOString() })}
        onRead={onRead}
      />
    )
    await userEvent.click(getByTestId("notification-item"))
    expect(onRead).not.toHaveBeenCalled()
  })

  it("falls back to a generic icon for an unknown type", () => {
    // `type` is text on the wire, so a newer server can send one this build
    // does not know about — it must still render.
    const { getByText } = render(
      <NotificationItem notification={notification({ type: "something_new" })} />
    )
    expect(getByText("Badge earned: First Steps")).toBeInTheDocument()
  })
})
