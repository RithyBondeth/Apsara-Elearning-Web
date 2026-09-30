import { describe, expect, it } from "vitest"
import { isAccessTokenLive } from "./token-expiry"

const NOW = Date.UTC(2026, 8, 30, 12, 0, 0)
const token = (payload: object) =>
  [
    "header",
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "sig",
  ].join(".")

describe("isAccessTokenLive", () => {
  it("is live until shortly before exp", () => {
    expect(isAccessTokenLive(token({ exp: NOW / 1000 + 600 }), NOW)).toBe(true)
    expect(isAccessTokenLive(token({ exp: NOW / 1000 + 2 }), NOW)).toBe(false)
  })

  it("is not live once expired", () => {
    expect(isAccessTokenLive(token({ exp: NOW / 1000 - 1 }), NOW)).toBe(false)
  })

  it("treats a missing or malformed token as not live (so the proxy refreshes)", () => {
    expect(isAccessTokenLive(null, NOW)).toBe(false)
    expect(isAccessTokenLive("not-a-jwt", NOW)).toBe(false)
    expect(isAccessTokenLive("a.%%%.c", NOW)).toBe(false)
    expect(isAccessTokenLive(token({ sub: "x" }), NOW)).toBe(false)
  })
})
