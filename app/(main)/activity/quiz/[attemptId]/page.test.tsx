import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ApiError } from "@/lib/api/client"
import type { IApiQuizAttemptReview } from "@/utils/interfaces/quiz/api.interface"

// A plain function rather than vi.fn(): vi.fn tracks returned promises, which
// turns a rejection the page handles into an "unhandled" test failure.
let respond: () => Promise<IApiQuizAttemptReview> = () => new Promise(() => {})

vi.mock("@/lib/api/quiz", () => ({ getAttemptReview: () => respond() }))
vi.mock("next/navigation", () => ({ useParams: () => ({ attemptId: "a1" }) }))
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

import QuizAttemptReviewPage from "./page"

const review: IApiQuizAttemptReview = {
  attempt: {
    id: "a1",
    quizId: "q1",
    userId: "u1",
    score: 50,
    totalQuestions: 2,
    correctAnswers: 1,
    completedAt: "2026-09-01T00:00:00Z",
    quizTitle: "Limits quiz",
    lessonId: "l1",
    lessonTitle: "Limits",
    courseSlug: "math-12",
    createdAt: "2026-09-01T00:00:00Z",
    updatedAt: "2026-09-01T00:00:00Z",
  },
  score: 50,
  passed: false,
  correctAnswers: 1,
  total: 2,
  earnedPoints: 1,
  totalPoints: 2,
  needsReview: 0,
  review: [
    {
      questionId: "qq1",
      type: "multiple_choice",
      question: "Pick two",
      explanation: "Because two.",
      points: 1,
      options: [
        { id: "o1", answer: "One", isCorrect: false },
        { id: "o2", answer: "Two", isCorrect: true },
      ],
      correctAnswer: null,
      yourAnswer: { selectedOptionId: "o1", answerData: null },
      isCorrect: false,
      requiresReview: false,
    },
    {
      questionId: "qq2",
      type: "numeric",
      question: "Two plus two",
      explanation: null,
      points: 1,
      options: [],
      correctAnswer: { value: 4 },
      yourAnswer: { selectedOptionId: null, answerData: { value: "4" } },
      isCorrect: true,
      requiresReview: false,
    },
  ],
}

describe("QuizAttemptReviewPage", () => {
  it("shows the stored score and every question's review", async () => {
    respond = () => Promise.resolve(review)
    render(<QuizAttemptReviewPage />)

    expect(await screen.findByText("Limits quiz")).toBeInTheDocument()
    expect(screen.getByText("50%")).toBeInTheDocument()
    expect(screen.getByText("failTitle")).toBeInTheDocument()
    expect(screen.getByText("Pick two")).toBeInTheDocument()
    expect(screen.getByText("Because two.")).toBeInTheDocument()
    expect(screen.getByText("Two plus two")).toBeInTheDocument()
    // No XP on a re-opened attempt — that's a submit-time event.
    expect(screen.queryByText(/xpEarned/)).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "retake" })).toHaveAttribute(
      "href",
      "/learn/math-12/l1"
    )
  })

  it("says the attempt wasn't found on a 404", async () => {
    respond = () => Promise.reject(new ApiError(404, "Attempt not found"))
    render(<QuizAttemptReviewPage />)
    expect(await screen.findByText("reviewNotFound")).toBeInTheDocument()
  })

  it("explains the review is unavailable for other errors", async () => {
    respond = () => Promise.reject(new ApiError(400, "not submitted"))
    render(<QuizAttemptReviewPage />)
    expect(await screen.findByText("reviewUnavailable")).toBeInTheDocument()
  })
})
