import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { IApiAiUsageSummary } from "@/utils/interfaces/ai/api.interface"

// A plain function rather than vi.fn(): vi.fn tracks returned promises, which
// turns a rejection the page handles into an "unhandled" test failure.
let respond: () => Promise<IApiAiUsageSummary> = () => new Promise(() => {})

vi.mock("@/lib/api/ai", () => ({ getAiUsage: () => respond() }))
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}))
vi.mock("@/components/utils/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock("@/components/utils/animations/animate-in", () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import AiUsagePage from "./page"

const summary = (
  over: Partial<IApiAiUsageSummary> = {}
): IApiAiUsageSummary => ({
  used: 250_000,
  limit: 1_000_000,
  remaining: 750_000,
  hasCredits: true,
  repliesUsed: 12,
  repliesLimit: null,
  repliesRemaining: null,
  periodEndsAt: null,
  exhausted: null,
  recent: [
    {
      id: "r1",
      feature: "chat",
      promptTokens: 1200,
      completionTokens: 300,
      totalTokens: 1500,
      createdAt: "2026-10-20T09:30:00Z",
    },
  ],
  ...over,
})

describe("AiUsagePage", () => {
  it("shows the 30-day allowance in thousands and each recent reply", async () => {
    respond = () => Promise.resolve(summary())
    render(<AiUsagePage />)

    expect(
      await screen.findByText('usedOf:{"used":250,"limit":1000}')
    ).toBeInTheDocument()
    expect(screen.getByText('remaining:{"remaining":750}')).toBeInTheDocument()
    expect(screen.getByText('tokens:{"total":"1,500"}')).toBeInTheDocument()
    expect(
      screen.getByText('tokensDetail:{"prompt":"1,200","completion":"300"}')
    ).toBeInTheDocument()
    expect(screen.queryByText("exhausted")).not.toBeInTheDocument()
  })

  it("explains when the allowance is used up", async () => {
    respond = () =>
      Promise.resolve(
        summary({
          used: 1_000_000,
          remaining: 0,
          hasCredits: false,
          exhausted: "tokens",
        })
      )
    render(<AiUsagePage />)

    expect(await screen.findByText("exhausted")).toBeInTheDocument()
  })

  it("says so when the learner hasn't used the tutor yet", async () => {
    respond = () => Promise.resolve(summary({ used: 0, recent: [] }))
    render(<AiUsagePage />)

    expect(await screen.findByText("noUsage")).toBeInTheDocument()
  })

  it("shows a load error instead of an empty page", async () => {
    respond = () => Promise.reject(new Error("down"))
    render(<AiUsagePage />)

    expect(await screen.findByText("loadError")).toBeInTheDocument()
    expect(screen.queryByText("recentTitle")).not.toBeInTheDocument()
  })

  it("shows the plan's replies for this billing period and when they reset", async () => {
    respond = () =>
      Promise.resolve(
        summary({
          repliesUsed: 200,
          repliesLimit: 200,
          repliesRemaining: 0,
          periodEndsAt: "2026-11-15T00:00:00Z",
          hasCredits: false,
          exhausted: "replies",
        })
      )
    render(<AiUsagePage />)

    expect(
      await screen.findByText('repliesUsedOf:{"used":200,"limit":200}')
    ).toBeInTheDocument()
    expect(screen.getByText(/repliesResetOn/)).toBeInTheDocument()
    expect(screen.getByText("repliesExhausted")).toBeInTheDocument()
    /* The token cap is relabelled as the safety limit, and isn't the reason. */
    expect(screen.getByText("tokenCapTitle")).toBeInTheDocument()
    expect(screen.queryByText("exhausted")).not.toBeInTheDocument()
  })

  it("hides the replies card when the plan sets no per-reply limit", async () => {
    respond = () => Promise.resolve(summary())
    render(<AiUsagePage />)

    expect(await screen.findByText("allowanceTitle")).toBeInTheDocument()
    expect(screen.queryByText("repliesTitle")).not.toBeInTheDocument()
  })
})
