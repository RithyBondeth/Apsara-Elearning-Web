<div align="center">

# Apsara Elearning — Web

**The student and admin web app for Apsara Elearning, a bilingual AI-powered learning platform for Cambodian students.**

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)

</div>

---

## Overview

Apsara Elearning Web is the frontend for Apsara Elearning (Apsara AI). It is a bilingual English and Khmer platform covering **Grades 1–12 across every subject** and **university courses for each major**, with a Khmer-speaking AI tutor.

It is a Next.js 16 App Router app that talks to the [Apsara Elearning API](https://github.com/RithyBondeth/Apsara-Elearning-API) through a same-origin **backend-for-frontend (BFF) proxy**. Sessions live in httpOnly cookies, and the browser never calls the gateways directly.

## Features

- **Course catalogue and learning player:** Markdown lessons with KaTeX math, video, graph plots, and the Khmer numerals used in the Khmer locale.
- **Quizzes and coding challenges,** with attempt review and an activity history.
- **AI tutor** chat powered by the backend's Apsara AI service.
- **Gamification:** dashboard, XP leaderboard, badges, and verifiable certificates (`/verify/[code]`).
- **Subscriptions:** pricing, billing, and entitlement-aware UI.
- **Admin console** for courses, lessons, structure (subjects, grade levels, faculties and majors), users, badges, plans, payments, reviews, testimonials, announcements, and certificates.
- **Secure auth:** login, registration, email verification, and password reset, with silent token refresh and a CSRF origin check.
- **English and Khmer localization** through `next-intl`.
- **Animated landing page** plus legal, contact, and support pages.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| State management | Zustand |
| Internationalization | next-intl (English and Khmer) |
| Forms and validation | React Hook Form, Zod |
| Content | react-markdown, remark-gfm, KaTeX |
| Animation | GSAP |
| Testing | Vitest |

## Architecture

```text
                        this Next.js app (:3000)
browser ──fetch─►  /api/proxy/*   ─┐  reads the httpOnly cookie, attaches the Bearer token,
                   /api/admin/*   ─┤  and silently refreshes and retries once on 401
                   /api/auth/*    ─┘        │
                                            ▼
                        api-gateway (:1111)  ·  admin-gateway (:2222)
```

`proxy.ts` (the Next.js 16 replacement for middleware) gates protected routes, redirects signed-in users away from the auth pages, and enforces a CSRF origin check on mutations.

## Getting Started

### Prerequisites

- Node.js 20 (see `.nvmrc`)
- The [Apsara Elearning API](https://github.com/RithyBondeth/Apsara-Elearning-API) running locally

### Installation

```bash
git clone https://github.com/RithyBondeth/Apsara-Elearning-Web.git
cd Apsara-Elearning-Web
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Public api-gateway base URL, e.g. `http://localhost:1111/api/v1/internal` |
| `ADMIN_API_URL` | Admin-gateway base URL (server-only) |
| `APP_ORIGIN` | Public web origin used for the CSRF check (production) |
| `INTERNAL_PROXY_SECRET` | Shared secret with the gateway, for real-IP rate limiting (production) |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Inbox used by the contact page |

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Type-check with `tsc --noEmit` |
| `npm test` | Run the Vitest suite |

## Project Structure

```text
Apsara-Elearning-Web/
├── app/
│   ├── (auth)/       # login, register, forgot and reset password, verify email
│   ├── (main)/       # dashboard, courses, learn, tutor, pricing, billing,
│   │                 # certificates, leaderboard, profile, activity
│   ├── admin/        # Admin console
│   └── api/          # BFF route handlers: auth/*, proxy/[...path], admin/[...path]
├── components/       # Feature UI and shadcn/ui primitives
├── hooks/            # Data hooks
├── language/         # en.json, km.json
├── lib/              # API clients, auth/session helpers, Zod schemas
├── stores/           # Zustand stores
└── proxy.ts          # Session gating and CSRF check
```

## Related Repositories

- [Apsara-Elearning-API](https://github.com/RithyBondeth/Apsara-Elearning-API): the NestJS microservices backend

## Author

**Rithy Bondeth** — Full Stack Developer & AI Engineer

[![Portfolio](https://img.shields.io/badge/Portfolio-0A0A0A?style=for-the-badge&logo=vercel&logoColor=white)](https://bondeth.dev)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/RithyBondeth)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rithy-bondeth-484073282/)

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.
