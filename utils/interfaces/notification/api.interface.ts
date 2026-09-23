/** Mirrors `NotificationResponseDTO` / `NotificationListResponseDTO`. */

export const NOTIFICATION_TYPES = [
  "badge_awarded",
  "quiz_passed",
  "challenge_solved",
  "course_completed",
  "certificate_issued",
  "subscription_updated",
] as const

export type TNotificationType = (typeof NOTIFICATION_TYPES)[number]

export interface IApiNotification {
  id: string
  /** One of TNotificationType; text on the wire, so unknown values are possible. */
  type: string
  title: string
  body?: string | null
  /** Deep-link payload — ids the client routes with. */
  data?: Record<string, unknown> | null
  /** When it was read; null while unread. */
  readAt?: string | null
  createdAt: string
}

export interface IApiNotificationList {
  items: IApiNotification[]
  /** Unread across everything, not just this page — drives the bell badge. */
  unreadCount: number
}

export interface IApiMarkRead {
  updated: number
  unreadCount: number
}
