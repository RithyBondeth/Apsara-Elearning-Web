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
