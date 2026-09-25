import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

// Plain functions rather than vi.fn(): vi.fn tracks returned promises, which
// turns a rejection the component handles into an "unhandled" test failure.
let mine: () => Promise<unknown> = () => Promise.resolve(null)
let save: (courseId: string, rating: number) => Promise<unknown> = () => Promise.resolve({})
const saved: [string, number][] = []

vi.mock("@/lib/api/rating", () => ({
  getMyRating: () => mine(),
  rateCourse: (courseId: string, rating: number) => {
    saved.push([courseId, rating])
    return save(courseId, rating)
  },
}))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}))

import { RatePrompt } from "."

// The test DOM has no localStorage; the prompt only needs get/set.
const store = new Map<string, string>()
vi.stubGlobal("localStorage", {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  clear: () => store.clear(),
})

const props = { courseId: "c1", courseSlug: "chemistry", courseTitle: "Chemistry", reason: "completed" as const }

describe("RatePrompt", () => {
  beforeEach(() => {
    store.clear()
    saved.length = 0
    mine = () => Promise.resolve(null)
    save = () => Promise.resolve({})
  })

  it("asks an unrated learner, naming the course", async () => {
    render(<RatePrompt {...props} />)
    expect(await screen.findByText(/completedTitle:.*Chemistry/)).toBeInTheDocument()
  })

  it("stays hidden when the learner already rated the course", async () => {
    mine = () => Promise.resolve({ id: "r1", rating: 4 })
    const { container } = render(<RatePrompt {...props} />)
    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it("saves the rating on one tap and offers the written review", async () => {
    render(<RatePrompt {...props} />)
    await screen.findByTestId("rate-prompt")
    await userEvent.click(screen.getByLabelText("4 stars"))

    expect(await screen.findByText("thanks")).toBeInTheDocument()
    expect(saved).toEqual([["c1", 4]])
    expect(screen.getByText("addReview").closest("a")).toHaveAttribute("href", "/courses/chemistry#ratings")
  })

  it("remembers a dismissal for this course", async () => {
    const { container, unmount } = render(<RatePrompt {...props} />)
    await userEvent.click(await screen.findByLabelText("dismiss"))
    expect(container).toBeEmptyDOMElement()
    unmount()

    const again = render(<RatePrompt {...props} />)
    expect(again.container).toBeEmptyDOMElement()
  })

  it("shows an error and keeps asking when saving fails", async () => {
    save = () => Promise.reject(new Error("offline"))
    render(<RatePrompt {...props} />)
    await screen.findByTestId("rate-prompt")
    await userEvent.click(screen.getByLabelText("5 stars"))

    expect(await screen.findByText("error")).toBeInTheDocument()
  })
})
