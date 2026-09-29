import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import type { IActivity } from "@/hooks/utils/use-activity"

let activity: IActivity = { attempts: [], submissions: [], error: false }

vi.mock("@/hooks/utils/use-activity", () => ({ useActivity: () => activity }))
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key}:${JSON.stringify(values)}` : key,
}))
vi.mock("@/components/utils/app-shell", () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))
vi.mock("@/components/utils/animations/animate-in", () => ({
  AnimateIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

import ActivityPage from "./page"

const attempt = (
  id: string,
  completedAt: string | null,
  score: number | null
) => ({
  id,
  quizId: "q1",
  userId: "u1",
  score,
  totalQuestions: 2,
  correctAnswers: score === null ? null : 1,
  completedAt,
  quizTitle: `Quiz ${id}`,
  lessonId: "l1",
  lessonTitle: "Limits",
  courseSlug: "math-12",
  createdAt: "2026-09-01T00:00:00Z",
  updatedAt: "2026-09-01T00:00:00Z",
})

describe("ActivityPage", () => {
  it("links a submitted attempt to its review page", () => {
    activity = {
      attempts: [attempt("a1", "2026-09-01T00:00:00Z", 80)],
      submissions: [],
      error: false,
    }
    render(<ActivityPage />)

    expect(screen.getByText("80%")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "review" })).toHaveAttribute(
      "href",
      "/activity/quiz/a1"
    )
  })

  it("marks an unsubmitted attempt instead of showing 0%", () => {
    activity = {
      attempts: [attempt("a2", null, null)],
      submissions: [],
      error: false,
    }
    render(<ActivityPage />)

    expect(screen.getByText("inProgress")).toBeInTheDocument()
    expect(screen.queryByText("0%")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("link", { name: "review" })
    ).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "openLesson" })).toHaveAttribute(
      "href",
      "/learn/math-12/l1"
    )
  })

  it("expands a coding submission to show its code and error", async () => {
    activity = {
      attempts: [],
      submissions: [
        {
          id: "s1",
          sourceCode: "print('hi')",
          language: "python",
          passed: false,
          testCasesPassed: 0,
          testCasesTotal: 2,
          errorMessage: "NameError: x",
          challengeTitle: "Hello",
          createdAt: "2026-09-01T00:00:00Z",
          updatedAt: "2026-09-01T00:00:00Z",
        },
      ],
      error: false,
    }
    render(<ActivityPage />)

    expect(screen.queryByText("print('hi')")).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole("button", { name: /showCode/ }))
    expect(screen.getByText("print('hi')")).toBeInTheDocument()
    expect(screen.getByText("NameError: x")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /hideCode/ })).toHaveAttribute(
      "aria-expanded",
      "true"
    )
  })
})
