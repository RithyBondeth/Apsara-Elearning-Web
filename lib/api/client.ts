/**
 * One API client for both environments, because `lib/api/catalog.ts` is called
 * from Server Components (`learn/[slug]/page.tsx`) *and* client components
 * (`api-lesson-reader`).
 *
 * - In the browser: calls the same-origin BFF proxy at `/api/proxy/*`. The
 *   session is an httpOnly cookie, so only the server can attach the bearer
 *   token — and the proxy also does the silent refresh-and-retry on 401.
 * - On the server: skips the proxy and calls the gateway directly, reading the
 *   cookie itself. Self-issuing an HTTP request to our own proxy would just add
 *   a hop.
 */
const PROXY_BASE = "/api/proxy"
const GATEWAY_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL

const isServer = typeof window === "undefined"

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/** NestJS errors are `{ statusCode, message, error }`; message may be an array. */
async function toApiError(res: Response, path: string): Promise<ApiError> {
  let message = `${path} failed with ${res.status}`
  try {
    const body = await res.json()
    const raw = body?.message
    if (typeof raw === "string") message = raw
    else if (Array.isArray(raw) && raw.length) message = String(raw[0])
  } catch {
    /* Non-JSON error body — keep the generic message. */
  }
  return new ApiError(res.status, message)
}

/**
 * Server-side leg. The dynamic import keeps `next/headers` out of the browser
 * bundle — a static import would break every client component that touches this
 * module.
 *
 * Note: this cannot refresh an expired access token, because Server Components
 * are not allowed to write cookies. A 401 here surfaces to the caller; the next
 * client-side call (or a fresh login) recovers it.
 */
async function serverFetch(method: string, path: string, body?: unknown) {
  const { cookies } = await import("next/headers")
  const { ACCESS_COOKIE } = await import("@/lib/auth/cookie-names")

  const token = (await cookies()).get(ACCESS_COOKIE)?.value

  return fetch(`${GATEWAY_URL}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  })
}

function browserFetch(method: string, path: string, body?: unknown) {
  return fetch(`${PROXY_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  })
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  if (isServer && !GATEWAY_URL) {
    throw new ApiError(500, "API_URL / NEXT_PUBLIC_API_URL is not configured")
  }

  const res = isServer
    ? await serverFetch(method, path, body)
    : await browserFetch(method, path, body)

  if (!res.ok) throw await toApiError(res, path)

  /* 204 and other empty bodies would break res.json(). */
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>("GET", path)
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body)
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body)
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path)
}
