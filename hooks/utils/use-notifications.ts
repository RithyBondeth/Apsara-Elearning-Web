"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/api/notification"
import type { IApiNotification } from "@/utils/interfaces/notification/api.interface"

/**
 * The learner's notification feed and unread count.
 *
 * `unreadCount` comes from the server rather than being counted off `items`:
 * the feed is a page, the badge is a total.
 */
export function useNotifications(limit?: number) {
  const [items, setItems] = useState<IApiNotification[] | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    getNotifications(limit)
      .then((data) => {
        if (cancelled) return
        setItems(data.items)
        setUnreadCount(data.unreadCount)
      })
      .catch(() => {
        // A guest gets a 401 — show an empty bell, not a spinner.
        if (!cancelled) setItems([])
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  const markRead = useCallback(async (id: string) => {
    /* Optimistic: the row greys out immediately. The server's count is the
       source of truth, so adopt whatever it returns. */
    setItems((current) =>
      current?.map((n) =>
        n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n
      ) ?? current
    )
    try {
      const result = await markNotificationRead(id)
      setUnreadCount(result.unreadCount)
    } catch {
      /* Leave the optimistic state; the next load reconciles it. */
    }
  }, [])

  const markAllRead = useCallback(async () => {
    const readAt = new Date().toISOString()
    setItems((current) => current?.map((n) => n.readAt ? n : { ...n, readAt }) ?? current)
    setUnreadCount(0)
    try {
      await markAllNotificationsRead()
    } catch {
      /* Same — reconciled on the next load. */
    }
  }, [])

  return { items, unreadCount, markRead, markAllRead }
}
