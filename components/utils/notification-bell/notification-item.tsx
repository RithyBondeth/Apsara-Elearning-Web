"use client"

import { Award, BookCheck, CreditCard, GraduationCap, Code2, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/utils/functions/time"
import type { IApiNotification } from "@/utils/interfaces/notification/api.interface"

/** Icon per notification type; unknown types fall back to a plain bell. */
const ICONS: Record<string, React.ElementType> = {
  badge_awarded: Award,
  quiz_passed: BookCheck,
  challenge_solved: Code2,
  course_completed: GraduationCap,
  certificate_issued: GraduationCap,
  subscription_updated: CreditCard,
}

/**
 * One row of the notification feed.
 *
 * Prop-driven and free of translated copy — the title and body are written by
 * the service that raised the notification, so there is nothing here to
 * localise, and the row renders from data alone.
 */
export function NotificationItem({
  notification,
  onRead,
}: {
  notification: IApiNotification
  onRead?: (id: string) => void
}) {
  const Icon = ICONS[notification.type] ?? Bell
  const unread = !notification.readAt

  return (
    <button
      type="button"
      data-testid="notification-item"
      data-unread={unread}
      onClick={() => unread && onRead?.(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted",
        unread && "bg-violet-50/70 dark:bg-violet-500/10"
      )}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0 rounded-lg p-1.5",
          unread
            ? "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {notification.title}
        </span>
        {notification.body && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {notification.body}
          </span>
        )}
      </span>

      <span className="shrink-0 text-[11px] text-muted-foreground tabular-nums">
        {timeAgo(notification.createdAt)}
      </span>
    </button>
  )
}
