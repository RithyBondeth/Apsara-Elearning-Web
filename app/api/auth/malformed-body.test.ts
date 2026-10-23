import { beforeEach, describe, expect, it, vi } from "vitest"

/**
 * Junk bodies get a 400 from every auth route, and never reach the gateway.
 * They used to throw inside the handler and come back as a 500.
 */
const callGateway = vi.fn()
vi.mock("@/lib/auth/gateway", () => ({
  callGateway: (...args: unknown[]) => callGateway(...args),
}))
vi.mock("@/lib/auth/session", () => ({ setSessionCookies: vi.fn() }))

import { POST as forgotPassword } from "./forgot-password/route"
import { POST as login } from "./login/route"
import { POST as register } from "./register/route"
import { POST as resendVerification } from "./resend-verification/route"
import { POST as resetPassword } from "./reset-password/route"
import { POST as verifyEmail } from "./verify-email/route"

const routes = {
  "forgot-password": forgotPassword,
  login,
  register,
  "resend-verification": resendVerification,
  "reset-password": resetPassword,
  "verify-email": verifyEmail,
}

const junk = {
  "malformed JSON": "{not json",
  "an empty body": "",
  "JSON null": "null",
  "a JSON array": "[1,2]",
}

beforeEach(() => callGateway.mockReset())

describe.each(Object.entries(routes))("POST /api/auth/%s", (name, handler) => {
  it.each(Object.entries(junk))("answers 400 to %s", async (_label, body) => {
    const res = await handler(
      new Request(`http://localhost/api/auth/${name}`, { method: "POST", body })
    )

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({
      message: "Request body must be a JSON object",
    })
    expect(callGateway).not.toHaveBeenCalled()
  })
})
