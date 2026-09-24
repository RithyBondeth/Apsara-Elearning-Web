import { apiGet, apiPatch } from "./client"
import type {
  IApiMarkRead,
  IApiNotificationList,
} from "@/utils/interfaces/notification/api.interface"

/** All notification endpoints resolve the learner from the session cookie. */

export const getNotifications = (limit?: number) =>
  apiGet<IApiNotificationList>(
    limit ? `/notification?limit=${limit}` : "/notification"
  )

export const markNotificationRead = (id: string) =>
  apiPatch<IApiMarkRead>(`/notification/${id}/read`)

export const markAllNotificationsRead = () =>
  apiPatch<IApiMarkRead>("/notification/read-all")
