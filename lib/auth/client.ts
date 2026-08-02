/**
 * Browser-side calls to the BFF auth endpoints under `/api/auth`. These set/clear
 * the httpOnly session cookies server-side, so the client only ever sees a small
 * JSON ack — never a token.
 */

export interface IAuthResult {
  ok: boolean
  status: number
  message: string
  /** Set by the login endpoint when the gateway returned 403 'Email not verified'. */
  emailNotVerified?: boolean
}

async function post(path: string, body?: unknown): Promise<IAuthResult> {
  let res: Response
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    return { ok: false, status: 0, message: "Cannot reach the server." }
  }

  let data: { message?: string; emailNotVerified?: boolean } = {}
  try {
    data = await res.json()
  } catch {
    /* Empty or non-JSON body — the status still tells us ok/not-ok. */
  }

  return {
    ok: res.ok,
    status: res.status,
    message: data.message ?? "",
    emailNotVerified: data.emailNotVerified,
  }
}

export const loginRequest = (body: { email: string; password: string }) =>
  post("/api/auth/login", body)

export const registerRequest = (body: Record<string, unknown>) =>
  post("/api/auth/register", body)

export const logoutRequest = () => post("/api/auth/logout")

export const verifyEmailRequest = (token: string) =>
  post("/api/auth/verify-email", { token })

export const resendVerificationRequest = (email: string) =>
  post("/api/auth/resend-verification", { email })

export const forgotPasswordRequest = (email: string) =>
  post("/api/auth/forgot-password", { email })

export const resetPasswordRequest = (token: string, newPassword: string) =>
  post("/api/auth/reset-password", { token, newPassword })
