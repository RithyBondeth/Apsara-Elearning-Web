import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import type { IApiPlatformStats } from "@/utils/interfaces/catalog/api.interface"

// A plain function rather than vi.fn(): vi.fn tracks returned promises, which
// turns the rejection the component handles into an "unhandled" test failure.
let respond: () => Promise<IApiPlatformStats> = () => new Promise(() => {})
const stats = (s: IApiPlatformStats) => (respond = () => Promise.resolve(s))

vi.mock("@/lib/api/catalog", () => ({ getPlatformStats: () => respond() }))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => `label:${key}` }))
// GSAP-driven counter: render the target value directly.
vi.mock("@/components/utils/animations/count-up", () => ({
  CountUp: ({ to }: { to: number }) => <span>{to}</span>,
}))
vi.mock("@/components/utils/animations/animate-in", () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock("@/components/utils/animations/spotlight-card", () => ({
  SpotlightCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import { LandingStats } from "."

describe("LandingStats", () => {
  it("shows the real totals from the API", async () => {
    stats({ courses: 9, lessons: 320, questions: 850, subjects: 4 })
    render(<LandingStats />)

    expect(await screen.findByText("320")).toBeInTheDocument()
    expect(screen.getByText("label:lessons")).toBeInTheDocument()
    expect(screen.getByText("850")).toBeInTheDocument()
  })

  it("hides stats that are zero", async () => {
    stats({ courses: 3, lessons: 12, questions: 0, subjects: 2 })
    render(<LandingStats />)

    await screen.findByText("label:courses")
    expect(screen.queryByText("label:questions")).not.toBeInTheDocument()
  })

  it("renders nothing when the request fails", async () => {
    respond = () => Promise.reject(new Error("offline"))
    const { container } = render(<LandingStats />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it("renders nothing when the catalog is empty", async () => {
    stats({ courses: 0, lessons: 0, questions: 0, subjects: 0 })
    const { container } = render(<LandingStats />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
