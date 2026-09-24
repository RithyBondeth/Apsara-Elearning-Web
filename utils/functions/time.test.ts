import { describe, expect, it } from "vitest"

import { timeAgo } from "@/utils/functions/time"

const now = new Date("2026-09-23T12:00:00.000Z")
const ago = (ms: number) => new Date(now.getTime() - ms).toISOString()

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

describe("timeAgo", () => {
  it("shows anything under a minute as 'now'", () => {
    expect(timeAgo(ago(0), now)).toBe("now")
    expect(timeAgo(ago(59_000), now)).toBe("now")
  })

  it("shows minutes under an hour", () => {
    expect(timeAgo(ago(MINUTE), now)).toBe("1m")
    expect(timeAgo(ago(59 * MINUTE), now)).toBe("59m")
  })

  it("shows hours under a day", () => {
    expect(timeAgo(ago(HOUR), now)).toBe("1h")
    expect(timeAgo(ago(23 * HOUR), now)).toBe("23h")
  })

  it("shows days under a week", () => {
    expect(timeAgo(ago(DAY), now)).toBe("1d")
    expect(timeAgo(ago(6 * DAY), now)).toBe("6d")
  })

  it("falls back to a date at a week and beyond", () => {
    // "7d" stops being useful when scanning history.
    const result = timeAgo(ago(7 * DAY), now)
    expect(result).not.toMatch(/^\d+[mhd]$/)
    expect(result).toMatch(/Sep/)
  })

  it("treats a future timestamp as 'now' rather than a negative age", () => {
    // Server/browser clock skew must not render "-1m".
    const future = new Date(now.getTime() + 5 * MINUTE).toISOString()
    expect(timeAgo(future, now)).toBe("now")
  })

  it("treats an unparseable value as 'now' rather than NaN", () => {
    expect(timeAgo("not-a-date", now)).toBe("now")
  })

  it("accepts a Date as well as an ISO string", () => {
    expect(timeAgo(new Date(now.getTime() - 2 * HOUR), now)).toBe("2h")
  })
})
