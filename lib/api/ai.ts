import { apiDelete, apiGet, apiPost } from "./client"
import type {
  IApiConversation,
  IApiAiMessage,
  IApiSendMessageResult,
  IApiAiCredits,
  IApiAiUsageSummary,
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

/* The provider and model are server settings; the gateway rejects either
   field in the body. */
export const sendMessage = (conversationId: string, content: string) =>
  apiPost<IApiSendMessageResult>(
    `/ai/conversations/${conversationId}/messages`,
    { content }
  )

export const getAiCredits = () => apiGet<IApiAiCredits>("/ai/credits")

/** The 30-day allowance plus the most recent replies (the API caps limit at 100). */
export const getAiUsage = (limit = 50) =>
  apiGet<IApiAiUsageSummary>(`/ai/usage?limit=${limit}`)
