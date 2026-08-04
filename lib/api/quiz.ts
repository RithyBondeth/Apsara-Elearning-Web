import { apiGet, apiPost } from "./client"
import type {
  IApiQuizAttempt,
  IApiQuizMeta,
  IApiQuizResult,
  IApiQuizStart,
  IQuizAnswerInput,
} from "@/utils/interfaces/quiz/api.interface"

/**
 * All quiz endpoints require an authenticated session (the /learn route is
 * already auth-gated). Grading is server-side — `start` never returns the
 * correct answers; `submit` returns the score plus a per-question review.
 */

/** The learner's quiz attempts, newest first, labelled by the API. */
export const getMyAttempts = () => apiGet<IApiQuizAttempt[]>("/quiz/attempts")

export const getLessonQuizzes = (lessonId: string) =>
  apiGet<IApiQuizMeta[]>(`/quiz/lesson/${lessonId}`)

export const startQuiz = (quizId: string) =>
  apiPost<IApiQuizStart>(`/quiz/${quizId}/start`)

export const submitAttempt = (attemptId: string, answers: IQuizAnswerInput[]) =>
  apiPost<IApiQuizResult>(`/quiz/attempt/${attemptId}/submit`, { answers })
