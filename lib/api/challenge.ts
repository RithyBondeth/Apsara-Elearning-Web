import { apiGet, apiPost } from "./client"
import type {
  IApiChallenge,
  IApiChallengeResult,
  IApiChallengeTestCase,
} from "@/utils/interfaces/challenge/api.interface"

export const getLessonChallenges = (lessonId: string) =>
  apiGet<IApiChallenge[]>(`/challenge/lesson/${lessonId}`)

export const getChallengeTestCases = (challengeId: string) =>
  apiGet<IApiChallengeTestCase[]>(`/challenge/${challengeId}/test-cases`)

export const submitChallenge = (
  challengeId: string,
  sourceCode: string,
  language: string
) =>
  apiPost<IApiChallengeResult>(`/challenge/${challengeId}/submit`, {
    sourceCode,
    language,
  })
