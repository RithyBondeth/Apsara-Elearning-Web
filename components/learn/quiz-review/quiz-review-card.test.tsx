import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import type { IApiQuizReviewItem } from "@/utils/interfaces/quiz/api.interface"
import { QuizReviewCard } from "./index"

/** Translation stub: key plus any values, so assertions can see both. */
const t = ((key: string, values?: Record<string, unknown>) =>
  values ? `${key}:${JSON.stringify(values)}` : key) as never

const shortAnswer = (
  over: Partial<IApiQuizReviewItem> = {}
): IApiQuizReviewItem => ({
  questionId: "q1",
  type: "short_answer",
  question: "Name the inputs of photosynthesis.",
  explanation: null,
  points: 3,
  options: [],
  correctAnswer: null,
  yourAnswer: { selectedOptionId: null, answerData: { text: "Water and CO2" } },
  isCorrect: false,
  requiresReview: false,
  pointsAwarded: 0,
  reviewFeedback: null,
  ...over,
})

describe("QuizReviewCard for a hand-graded short answer", () => {
  it("shows a pending answer as waiting, not as wrong", () => {
    render(
      <QuizReviewCard
        item={shortAnswer({ requiresReview: true })}
        index={0}
        t={t}
      />
    )

    expect(screen.getByText("awaitingReview")).toBeInTheDocument()
    expect(screen.queryByText(/correctAnswer/)).not.toBeInTheDocument()
    expect(screen.queryByText(/pointsOf/)).not.toBeInTheDocument()
  })

  it("shows the teacher's points and note once graded", () => {
    render(
      <QuizReviewCard
        item={shortAnswer({
          pointsAwarded: 2,
          reviewFeedback: "Name both gases.",
        })}
        index={0}
        t={t}
      />
    )

    expect(
      screen.getByText('pointsOf:{"awarded":2,"total":3}')
    ).toBeInTheDocument()
    expect(screen.getByText("Name both gases.")).toBeInTheDocument()
    expect(screen.queryByText("awaitingReview")).not.toBeInTheDocument()
    /* There's no answer key to show for a hand-graded question. */
    expect(screen.queryByText(/correctAnswer/)).not.toBeInTheDocument()
  })
})
