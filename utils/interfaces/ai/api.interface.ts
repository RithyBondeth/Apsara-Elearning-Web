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

/** Mirrors CreditsResponseDTO. */
export interface IApiAiCredits {
  used: number
  limit: number
  remaining: number
  hasCredits: boolean
}
