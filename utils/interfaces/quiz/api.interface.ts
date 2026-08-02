/** Mirrors QUESTION_TYPES in apsara-elearning-api (libs/contracts). */
export type TQuestionType =
  | "multiple_choice"
  | "true_false"
  | "fill_blank"
  | "short_answer"
  | "matching"
  | "numeric"

/** Quiz metadata from `GET /quiz/lesson/:lessonId` (no questions). */
export interface IApiQuizMeta {
  id: string
  lessonId: string
  title: string
  description?: string
  xpReward?: number
  createdAt: string
  updatedAt: string
}

/** A question as returned by `start` — never carries the correct answer. */
export interface IApiQuizQuestion {
  id: string
  type: TQuestionType
  question: string
  points: number
  order: number
  /** Choice types only; empty for numeric/true_false/fill_blank. */
  options: { id: string; answer: string }[]
  /** Matching only — shuffled right-hand pool. */
  prompt: { lefts: string[]; rights: string[] } | null
}

export interface IApiQuizAttempt {
  id: string
  quizId: string
  userId: string
  score: number | null
  totalQuestions: number
  correctAnswers: number | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

/** Shape of `POST /quiz/:quizId/start`. */
export interface IApiQuizStart {
  attempt: IApiQuizAttempt
  quiz: IApiQuizMeta
  questions: IApiQuizQuestion[]
}

/** One answer the student submits. */
export interface IQuizAnswerInput {
  questionId: string
  selectedOptionId?: string
  answerData?: Record<string, unknown>
}

/** Per-question review returned by `submit` (post-submit only). */
export interface IApiQuizReviewItem {
  questionId: string
  type: TQuestionType
  question: string
  explanation: string | null
  points: number
  options: { id: string; answer: string; isCorrect: boolean }[]
  /** Type-specific correct-answer spec (numeric/true_false/fill_blank). */
  correctAnswer: Record<string, unknown> | null
  yourAnswer: {
    selectedOptionId: string | null
    answerData: Record<string, unknown> | null
  } | null
  isCorrect: boolean
  requiresReview: boolean
}

/** Shape of `POST /quiz/attempt/:attemptId/submit`. */
export interface IApiQuizResult {
  attempt: IApiQuizAttempt
  score: number
  passed: boolean
  correctAnswers: number
  total: number
  earnedPoints: number
  totalPoints: number
  needsReview: number
  xpAwarded: number
  review: IApiQuizReviewItem[]
}
