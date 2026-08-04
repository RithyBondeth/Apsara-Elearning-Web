import { apiPost } from "@/lib/api/client"

export type TSupportCategory =
  | "account"
  | "learning"
  | "aiTutor"
  | "billing"
  | "privacy"
  | "other"

export interface ISupportContactRequest {
  name: string
  email: string
  category: TSupportCategory
  subject: string
  message: string
  requestId: string
  website?: string
}

export interface ISupportContactResponse {
  message: string
}

export const sendSupportContact = (body: ISupportContactRequest) =>
  apiPost<ISupportContactResponse>("/support/contact", body)
