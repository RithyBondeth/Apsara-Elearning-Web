/** Mirrors ConversationResponseDTO in apsara-elearning-api (libs/contracts). */
export interface IApiConversation {
  id: string
  userId: string
  title: string
  courseId?: string | null
  lessonId?: string | null
  createdAt: string
  updatedAt: string
}

/** Mirrors AiMessageResponseDTO. */
export interface IApiAiMessage {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt: string
  provider?: string
  model?: string
}

/** Mirrors SendMessageResponseDTO. */
export interface IApiSendMessageResult {
  message: IApiAiMessage
  mock: boolean
}

/** Mirrors CreditsResponseDTO: the plan's reply allowance and the token cap. */
export interface IApiAiCredits {
  /** Tokens in the last 30 days, against the safety cap. */
  used: number
  limit: number
  remaining: number
  hasCredits: boolean
  /** Tutor replies in the current billing period. */
  repliesUsed: number
  /** Replies the plan allows per billing period; null = no per-reply limit. */
  repliesLimit: number | null
  repliesRemaining: number | null
  /** When the reply allowance resets. */
  periodEndsAt: string | null
  /** Which allowance ran out, when hasCredits is false. */
  exhausted: "replies" | "tokens" | null
}

/** Mirrors AiUsageResponseDTO: the tokens one tutor reply spent. */
export interface IApiAiUsageRecord {
  id: string
  feature?: string | null
  promptTokens?: number | null
  completionTokens?: number | null
  totalTokens?: number | null
  createdAt: string
}

/** Mirrors AiUsageSummaryResponseDTO: the allowance plus recent replies. */
export interface IApiAiUsageSummary extends IApiAiCredits {
  recent: IApiAiUsageRecord[]
}
