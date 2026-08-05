import { ApiError } from "@/lib/api/client"

/**
 * Client for the admin gateway.
 *
 * Separate from `lib/api/client.ts` because the admin gateway is a different
 * service behind a different proxy route (`/api/admin/*` → `ADMIN_API_URL`).
 *
 * Browser-only by design. Every admin screen is an interactive client component,
 * and keeping the server leg out means `ADMIN_API_URL` is never read anywhere the
 * bundler could trace into the client graph. The one server-side admin read —
 * the admin claim in `app/admin/layout.tsx` — goes through the ordinary
 * api-gateway's `/user/me`, not through here.
 */
const ADMIN_BASE = "/api/admin"

/** NestJS errors are `{ statusCode, message, error }`; message may be an array. */
async function toApiError(res: Response, path: string): Promise<ApiError> {
  let message = `${path} failed with ${res.status}`
  try {
    const body = await res.json()
    const raw = body?.message
    if (typeof raw === "string") message = raw
    else if (Array.isArray(raw) && raw.length) message = raw.join(", ")
  } catch {
    /* Non-JSON error body — keep the generic message. */
  }
  return new ApiError(res.status, message)
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  if (typeof window === "undefined") {
    throw new ApiError(500, "The admin client is browser-only")
  }

  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
  })

  if (!res.ok) throw await toApiError(res, path)

  /* 204 and other empty bodies would break res.json(). */
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}

export function adminGet<T>(path: string): Promise<T> {
  return request<T>("GET", path)
}

export function adminPost<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("POST", path, body)
}

export function adminPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>("PATCH", path, body)
}

export function adminDelete<T>(path: string): Promise<T> {
  return request<T>("DELETE", path)
}
