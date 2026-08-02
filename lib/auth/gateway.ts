import "server-only"

/**
 * Server-side calls from the BFF route handlers to the NestJS gateway.
 *
 * `API_URL` lets deployments point the server at an internal hostname the
 * browser can't reach; it falls back to the public URL for local dev.
 */
const GATEWAY_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL

export interface IGatewayResult<T> {
  ok: boolean
  status: number
  data: T | null
  /** Flattened gateway message, safe to show to the user. */
  message: string
}

/** NestJS errors are `{ statusCode, message, error }`, where message may be an array. */
function flattenMessage(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "message" in body) {
    const raw = (body as { message: unknown }).message
    if (typeof raw === "string") return raw
    if (Array.isArray(raw) && raw.length) return String(raw[0])
  }
  return fallback
}

export async function callGateway<T>(
  path: string,
  init: { method?: string; body?: unknown; accessToken?: string | null } = {}
): Promise<IGatewayResult<T>> {
  if (!GATEWAY_URL) {
    return {
      ok: false,
      status: 500,
      data: null,
      message: "API_URL / NEXT_PUBLIC_API_URL is not configured",
    }
  }

  let res: Response
  try {
    res = await fetch(`${GATEWAY_URL}${path}`, {
      method: init.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.accessToken
          ? { Authorization: `Bearer ${init.accessToken}` }
          : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      /* Auth responses must never be cached between users. */
      cache: "no-store",
    })
  } catch {
    /* Gateway unreachable — surface it as 503 rather than a generic 500 so the
       UI can distinguish "server down" from "bad credentials". */
    return {
      ok: false,
      status: 503,
      data: null,
      message: "Cannot reach the server. Please try again.",
    }
  }

  /* A proxy or crash can return HTML instead of JSON — parsing must not throw. */
  const text = await res.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }

  return {
    ok: res.ok,
    status: res.status,
    data: res.ok ? (body as T) : null,
    message: res.ok ? "" : flattenMessage(body, `Request failed (${res.status})`),
  }
}
