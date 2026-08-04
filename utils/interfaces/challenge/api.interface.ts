export interface IApiChallenge {
  id: string
  lessonId: string
  title: string
  description?: string
  starterCode?: string
  xpReward?: number
  createdAt: string
  updatedAt: string
}

export interface IApiChallengeTestCase {
  id: string
  input?: string
  expectedOutput: string
  isHidden?: boolean
  order?: number
  createdAt: string
  updatedAt: string
}

export interface IApiChallengeSubmission {
  id: string
  sourceCode: string
  language: string
  challengeId?: string
  passed?: boolean
  score?: number | null
  testCasesPassed?: number | null
  testCasesTotal?: number | null
  executionTimeMs?: number | null
  errorMessage?: string | null
  /* Joined by the API so a history list can name the challenge. */
  challengeTitle?: string
  lessonId?: string
  createdAt: string
  updatedAt: string
}

export interface IApiChallengeResult {
  submission: IApiChallengeSubmission
  passed: boolean
  score: number
  testCasesPassed: number
  testCasesTotal: number
  xpAwarded: number
  mock: boolean
}
