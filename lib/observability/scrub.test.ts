import { describe, expect, it } from "vitest"
import type { ErrorEvent } from "@sentry/nextjs"
import { scrubBreadcrumb, scrubEvent, stripQuery } from "./scrub"

/** Session tokens and personal data must never reach the error tracker. */
describe("scrubEvent", () => {
  const event = (): ErrorEvent =>
    ({
      type: undefined,
      user: { ip_address: "203.0.113.7", email: "a@b.com" },
      request: {
        url: "https://elearning.apsara.social/reset-password?token=SECRET",
        query_string: "token=SECRET",
        cookies: { apsara_access: "SECRET", apsara_refresh: "SECRET" },
        data: '{"password":"SECRET"}',
        headers: {
          Cookie: "apsara_access=SECRET",
          authorization: "Bearer SECRET",
          "x-apsara-proxy-secret": "SECRET",
          "x-apsara-client-ip": "203.0.113.7",
          "x-forwarded-for": "203.0.113.7",
          "user-agent": "Mozilla/5.0",
          "content-type": "application/json",
        },
      },
    }) as ErrorEvent

  it("removes every credential and personal field", () => {
    const scrubbed = scrubEvent(event())

    expect(JSON.stringify(scrubbed)).not.toContain("SECRET")
    expect(JSON.stringify(scrubbed)).not.toContain("203.0.113.7")
    expect(scrubbed.user).toBeUndefined()
  })

  it("keeps what helps debugging: path and harmless headers", () => {
    const { request } = scrubEvent(event())

    expect(request?.url).toBe("https://elearning.apsara.social/reset-password")
    expect(request?.headers).toEqual({
      "user-agent": "Mozilla/5.0",
      "content-type": "application/json",
    })
  })

  it("leaves an event without a request alone", () => {
    expect(scrubEvent({ type: undefined, message: "x" } as ErrorEvent)).toEqual(
      {
        type: undefined,
        message: "x",
      }
    )
  })
})

describe("scrubBreadcrumb", () => {
  it("drops query strings from fetch breadcrumbs", () => {
    expect(
      scrubBreadcrumb({
        category: "fetch",
        data: { url: "/api/proxy/auth/verify?token=SECRET", status_code: 200 },
      }).data
    ).toEqual({ url: "/api/proxy/auth/verify", status_code: 200 })
  })
})

describe("stripQuery", () => {
  it("cuts at ? or #", () => {
    expect(stripQuery("/a?b=1#c")).toBe("/a")
    expect(stripQuery("/a#c")).toBe("/a")
    expect(stripQuery("/a")).toBe("/a")
  })
})
