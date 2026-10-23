import { describe, expect, it } from "vitest"
import { notificationHref } from "./notification-item"
import type { IApiNotification } from "@/utils/interfaces/notification/api.interface"

const notification = (over: Partial<IApiNotification>): IApiNotification =>
  ({
    id: "n1",
    type: "quiz_graded",
    title: "Quiz graded",
    body: null,
    data: null,
    readAt: null,
    createdAt: "2026-10-24T00:00:00Z",
    ...over,
  }) as IApiNotification

describe("notificationHref for a graded quiz", () => {
  it("opens that attempt's review", () => {
    expect(
      notificationHref(notification({ data: { attemptId: "a1", score: 80 } }))
    ).toBe("/activity/quiz/a1")
  })

  it("leads nowhere without an attempt id", () => {
    expect(notificationHref(notification({ data: {} }))).toBeNull()
  })
})
