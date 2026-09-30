// @vitest-environment node
import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth/cookie-names"

const renewSession = vi.fn()
vi.mock("@/lib/auth/renew-session", () => ({
  renewSession: (...args: unknown[]) => renewSession(...args),
}))

import { proxy } from "./proxy"

const jwt = (expInSeconds: number) =>
  [
    "h",
    Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expInSeconds })
    ).toString("base64url"),
    "s",
  ].join(".")

function request(
  path: string,
  cookies: Record<string, string>,
  headers: Record<string, string> = {}
) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: {
      ...headers,
      cookie: Object.entries(cookies)
        .map(([k, v]) => `${k}=${v}`)
        .join("; "),
    },
  })
}

beforeEach(() => renewSession.mockReset())

describe("proxy session renewal", () => {
  it("renews an expired access token before an admin page renders", async () => {
    renewSession.mockResolvedValue({
      accessToken: "new-access",
      refreshToken: "new-refresh",
    })

    const res = await proxy(
      request("/admin/users", {
        [ACCESS_COOKIE]: jwt(-60),
        [REFRESH_COOKIE]: "old-refresh",
      })
    )

    expect(renewSession).toHaveBeenCalledWith("old-refresh", expect.anything())
    // Persisted in the browser…
    expect(res.cookies.get(ACCESS_COOKIE)?.value).toBe("new-access")
    expect(res.cookies.get(REFRESH_COOKIE)?.value).toBe("new-refresh")
    expect(res.cookies.get(ACCESS_COOKIE)).toMatchObject({
      httpOnly: true,
      path: "/",
    })
    // …and forwarded to this request's server render.
    expect(res.headers.get("x-middleware-request-cookie")).toContain(
      `${ACCESS_COOKIE}=new-access`
    )
  })

  it("also renews when the access cookie is gone but the session isn't", async () => {
    renewSession.mockResolvedValue({ accessToken: "a", refreshToken: "r" })
    await proxy(request("/dashboard", { [REFRESH_COOKIE]: "old-refresh" }))
    expect(renewSession).toHaveBeenCalled()
  })

  it("leaves a live access token alone", async () => {
    const res = await proxy(
      request("/admin/users", {
        [ACCESS_COOKIE]: jwt(600),
        [REFRESH_COOKIE]: "r",
      })
    )
    expect(renewSession).not.toHaveBeenCalled()
    expect(res.cookies.get(ACCESS_COOKIE)).toBeUndefined()
  })

  it("doesn't renew on prefetches, public pages or API routes", async () => {
    const expired = { [ACCESS_COOKIE]: jwt(-60), [REFRESH_COOKIE]: "r" }
    await proxy(
      request("/admin/users", expired, { "next-router-prefetch": "1" })
    )
    await proxy(request("/verify/APS-0000-0000-0000", expired))
    await proxy(request("/api/proxy/user/me", expired))
    expect(renewSession).not.toHaveBeenCalled()
  })

  it("carries on unchanged when renewal fails", async () => {
    renewSession.mockResolvedValue(null)
    const res = await proxy(
      request("/admin/users", {
        [ACCESS_COOKIE]: jwt(-60),
        [REFRESH_COOKIE]: "r",
      })
    )
    expect(res.cookies.get(ACCESS_COOKIE)).toBeUndefined()
    expect(res.headers.get("location")).toBeNull()
  })

  it("still sends visitors without a session to login", async () => {
    const res = await proxy(request("/admin/users", {}))
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?next=%2Fadmin%2Fusers"
    )
    expect(renewSession).not.toHaveBeenCalled()
  })
})
