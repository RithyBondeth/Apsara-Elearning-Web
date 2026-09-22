# Apsara Elearning Web — Apsara AI

Frontend for **Apsara Elearning / Apsara AI**, a bilingual (English + Khmer)
e-learning platform for Cambodia covering **Grade 1–12 across every subject** and
**university courses per major**. It's a **Next.js 16 App Router** app (React 19,
Tailwind v4, shadcn/ui) that talks to the [NestJS microservices
API](https://github.com/RithyBondeth/Apsara-Elearning-API) through a same-origin **backend-for-frontend (BFF)
proxy** — the browser never addresses the gateways directly.

## Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 (App Router, Turbopack, React 19) |
| Styling | Tailwind CSS v4 + shadcn/ui (`radix-ui`, `class-variance-authority`) |
| State | Zustand (`stores/`) |
| i18n | `next-intl` — English (`language/en.json`) + Khmer (`language/km.json`) |
| Forms / validation | `react-hook-form` + Zod (`lib/validation/`) |
| Content rendering | `react-markdown` + `remark-gfm`, KaTeX math (`remark-math` / `rehype-katex`), GSAP animation |
| Tests | Vitest (`*.test.ts`) |

## Architecture — the BFF proxy

The session lives in **httpOnly cookies on this origin**, so the browser cannot
attach a bearer token itself. Every authenticated request is routed through this
app's server, which reads the cookie and calls the gateway.

```
                        this Next.js app (:3000)
browser ──fetch─►  /api/proxy/*   ─┐  reads httpOnly cookie, attaches Bearer,
                   /api/admin/*   ─┤  does silent refresh-and-retry on 401
                   /api/auth/*    ─┘        │
                                            ▼
                        api-gateway (:1111)  ·  admin-gateway (:2222)
```

- **`app/api/proxy/[...path]`** — authenticated pass-through to the public
  api-gateway. A `401` triggers **one silent refresh-and-retry**, server-side, so
  token rotation is invisible to the client (no interceptor, no two-tab refresh
  race).
- **`app/api/admin/[...path]`** — same idea for the admin-gateway, which is
  **never addressed from the browser** (`ADMIN_API_URL` is server-only).
- **`app/api/auth/*`** — login/register/refresh/etc. exchange credentials with the
  gateway and write the token pair **straight into httpOnly cookies**; tokens are
  never returned in a response body.
- **`lib/api/client.ts`** is isomorphic: in the browser it calls `/api/proxy/*`;
  in a Server Component it skips the proxy and calls the gateway directly, reading
  the cookie itself (Server Components can't refresh, so a `401` there is
  recovered by the next client call).

### Routing & session gating — `proxy.ts`

`proxy.ts` is the **Next.js 16 proxy** (the renamed middleware). It:

- **gates protected routes** (`/dashboard`, `/learn`, `/profile`, `/tutor`,
  `/certificates`, `/activity`, `/billing`, `/admin`) on the *presence* of the
  refresh cookie — a redirect decision only; real authorization is the gateway's
  `JwtAuthGuard`/`AdminGuard` on every request. It uses the 7-day **refresh**
  cookie (not the 1-day access cookie) as the session signal so an expired access
  token is silently refreshed rather than bounced to `/login`.
- **redirects signed-in users** away from `/login`, `/register`, etc.
- **enforces a CSRF origin check** on cookie-authenticated mutations against
  `APP_ORIGIN`.

Admin status is deliberately *not* trusted from a cookie: `app/admin/layout.tsx`
resolves it from `/user/me` server-side.

### Cookies

`access` (1d) and `refresh` (7d), both httpOnly. In production they take the
`__Host-` prefix (`lib/auth/cookie-names.ts`).

## Prerequisites

- **Node.js 20** (`.nvmrc`)
- The **[Apsara Elearning API](https://github.com/RithyBondeth/Apsara-Elearning-API)** running locally
  (api-gateway on `:1111`, admin-gateway on `:2222`)

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in values (see "Environment" below)
npm run dev                  # http://localhost:3000
```

## Scripts

```bash
npm run dev              # dev server (Turbopack)
npm run build            # production build
npm run start            # serve the production build
npm run lint             # eslint
npm run format           # prettier --write
npm run typecheck        # tsc --noEmit
npm test                 # Vitest (unit tests)
npm run test:watch       # Vitest watch mode
npm run preview:chemistry # regenerate the chemistry preview asset
```

## Environment

Copy `.env.example` to `.env.local`. Variables prefixed `NEXT_PUBLIC_` are exposed
to the browser; the rest are **server-only**.

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ | Base URL of the api-gateway incl. its prefix, e.g. `http://localhost:1111/api/v1/internal` |
| `ADMIN_API_URL` | admin | Base URL of the admin-gateway, e.g. `http://localhost:2222/admin`. Server-only — reached from the browser via `/api/admin/*`. Without it, `/admin` loads but every request 500s |
| `APP_ORIGIN` | production | Exact public web origin used for the CSRF check, e.g. `http://localhost:3000` |
| `INTERNAL_PROXY_SECRET` | production | Shared secret with the gateway (its `INTERNAL_PROXY_SECRET`), min 32 chars. Lets the gateway rate-limit by the real browser IP instead of this server's address. Server-only |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | — | Inbox used by the Contact page's prepared-email workflow |

`API_URL` may be set to override `NEXT_PUBLIC_API_URL` for server-side calls.

## Project structure

```
app/
  (auth)/        login, register, forgot/reset password, verify-email
  (main)/        dashboard, courses, learn, tutor, pricing, billing,
                 certificates, profile, activity
  admin/         courses/lessons authoring, taxonomy, users, badges, plans
  api/           BFF route handlers — auth/*, proxy/[...path], admin/[...path]
components/      feature UI (admin, auth, learn, tutor, subscription, …) + ui/ (shadcn)
stores/          Zustand stores (profile, entitlements, subscriptions, languages)
lib/
  api/           per-domain API clients + the isomorphic client + admin client
  auth/          session, cookies, gateway helper, silent refresh
  validation/    Zod schemas (mirror the gateway DTOs)
hooks/           data hooks (courses, badges, certificates, activity, …)
language/        en.json, km.json (next-intl messages)
utils/           functions, constants, interfaces, types
proxy.ts         Next 16 proxy: session gating + CSRF origin check
```

## Entitlements (UI only)

`GET /subscription/entitlements` is hydrated into a non-persisted Zustand store
(`stores/entitlements/`) for UI decisions — showing a lock, gating a button. It is
**never** the source of truth: the course and AI services enforce access
independently on every request, so a tampered store buys a different-looking page,
not data.

## Testing

Unit tests run on **Vitest** (`npm test`), co-located as `*.test.ts`, covering pure
logic — validation schemas, formatting helpers, and stores.

The harness is intentionally **JSX-free**: adding `@vitejs/plugin-react` pulls a
`@babel` version that conflicts (ERESOLVE) with `shadcn`, so component/DOM tests
are deferred until that is resolved.

## Notes

- **Math & markdown**: lesson content and the AI tutor render Markdown with GFM
  and KaTeX; interpolated numbers are converted to Khmer numerals in the `km`
  locale (`utils/functions/format.ts`).
- This app is the client half of a two-repo project; see the
  [API README](https://github.com/RithyBondeth/Apsara-Elearning-API#readme) for the backend, content model,
  and endpoint map.
