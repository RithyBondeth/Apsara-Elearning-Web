import { render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { IApiFeaturedReviews } from "@/utils/interfaces/rating/api.interface"

// A plain function rather than vi.fn(): vi.fn tracks returned promises, which
// turns a rejection the component handles into an "unhandled" test failure.
let respond: () => Promise<IApiFeaturedReviews> = () => new Promise(() => {})

vi.mock("@/lib/api/rating", () => ({ getFeaturedReviews: () => respond() }))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}))
vi.mock("@/components/utils/animations/animate-in", () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import { LandingReviews } from "."

const review = (id: string, text: string) => ({
  id,
  rating: 5,
  review: text,
  displayName: `Learner ${id}`,
  avatar: "rocket",
  createdAt: "2026-09-01T00:00:00Z",
  courseTitle: "Grade 12 Chemistry",
  courseSlug: "chemistry",
})

const reviews = (n: number, average: number | null = 4.4, count = 7): IApiFeaturedReviews => ({
  average,
  count,
  items: Array.from({ length: n }, (_, i) => review(String(i), `Quote ${i}`)),
})

describe("LandingReviews", () => {
  it("shows featured reviews with the real overall rating", async () => {
    respond = () => Promise.resolve(reviews(3))
    render(<LandingReviews />)

    expect(await screen.findByText("“Quote 0”")).toBeInTheDocument()
    expect(screen.getByText("Learner 2")).toBeInTheDocument()
    expect(screen.getByText(/summary:.*"average":"4.4".*"count":7/)).toBeInTheDocument()
    expect(screen.getAllByRole("link")[0]).toHaveAttribute("href", "/courses/chemistry")
  })

  it("stays hidden with fewer than three featured reviews", async () => {
    respond = () => Promise.resolve(reviews(2))
    const { container } = render(<LandingReviews />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it("counts teacher testimonials toward the minimum and shows their role", async () => {
    respond = () =>
      Promise.resolve({
        ...reviews(2),
        testimonials: [
          { id: "t1", name: "Sophea K.", role: "Grade 12 Chemistry teacher", quote: "My students use it daily." },
        ],
      })
    render(<LandingReviews />)

    expect(await screen.findByText("“My students use it daily.”")).toBeInTheDocument()
    expect(screen.getByText("Grade 12 Chemistry teacher")).toBeInTheDocument()
    expect(screen.getByText("“Quote 1”")).toBeInTheDocument()
  })

  it("stays hidden when the request fails", async () => {
    respond = () => Promise.reject(new Error("offline"))
    const { container } = render(<LandingReviews />)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })
})
