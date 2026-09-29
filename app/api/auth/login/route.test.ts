import { beforeEach, describe, expect, it, vi } from "vitest"

let gateway: unknown
const setSessionCookies = vi.fn()

vi.mock("@/lib/auth/gateway", () => ({
  callGateway: () => Promise.resolve(gateway),
}))
vi.mock("@/lib/auth/session", () => ({
  setSessionCookies: (tokens: unknown) => setSessionCookies(tokens),
}))

import { POST } from "./route"

const login = () =>
  POST(
    new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "pw" }),
    })
  )

beforeEach(() => setSessionCookies.mockClear())

describe("POST /api/auth/login", () => {
  it("offers the resend prompt only for an unverified email", async () => {
    gateway = {
      ok: false,
      status: 403,
      data: null,
      message: "Email not verified",
    }
    const body = await (await login()).json()
    expect(body).toMatchObject({
      emailNotVerified: true,
      accountSuspended: false,
    })
  })

  it("flags a suspended account instead of an unverified one", async () => {
    gateway = {
      ok: false,
      status: 403,
      data: null,
      message: "Account suspended",
    }
    const res = await login()
    expect(res.status).toBe(403)
    expect(await res.json()).toMatchObject({
      emailNotVerified: false,
      accountSuspended: true,
    })
  })

  it("stores only the tokens and reports a cancelled deletion", async () => {
    gateway = {
      ok: true,
      status: 200,
      message: "",
      data: { accessToken: "a", refreshToken: "r", deletionCancelled: true },
    }
    const body = await (await login()).json()
    expect(setSessionCookies).toHaveBeenCalledWith({
      accessToken: "a",
      refreshToken: "r",
    })
    expect(body).toEqual({ ok: true, deletionCancelled: true })
  })
})
