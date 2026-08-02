import { apiDelete, apiGet, apiPost } from "./client"
import type {
  IApiConversation,
  IApiAiMessage,
  IApiSendMessageResult,
  IApiAiCredits,
} from "@/utils/interfaces/ai/api.interface"

/**
 * Apsara AI (tutor) endpoints. The gateway resolves the user from the JWT, so
 * no userId is passed from here.
 */

export const listConversations = () =>
  apiGet<IApiConversation[]>("/ai/conversations")

export const createConversation = (body?: {
  title?: string
  courseId?: string
  lessonId?: string
}) => apiPost<IApiConversation>("/ai/conversations", body ?? {})

export const getConversation = (id: string) =>
  apiGet<IApiConversation>(`/ai/conversations/${id}`)

export const deleteConversation = (id: string) =>
  apiDelete<{ message: string; id: string }>(`/ai/conversations/${id}`)

export const listMessages = (conversationId: string) =>
  apiGet<IApiAiMessage[]>(`/ai/conversations/${conversationId}/messages`)

export const sendMessage = (
  conversationId: string,
  content: string,
  opts?: { provider?: string; model?: string }
) =>
  apiPost<IApiSendMessageResult>(
    `/ai/conversations/${conversationId}/messages`,
    { content, ...opts }
  )

export const getAiCredits = () => apiGet<IApiAiCredits>("/ai/credits")
