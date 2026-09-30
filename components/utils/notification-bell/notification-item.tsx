"use client"

import Link from "next/link"
import { Award, BookCheck, CreditCard, GraduationCap, Code2, Bell, Star, ShieldX, Megaphone } from "lucide-react"
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
  certificate_revoked: ShieldX,
  subscription_updated: CreditCard,
  rating_requested: Star,
  announcement: Megaphone,
}

/**
 * Where a notification leads, when it leads anywhere: a rating request to the
 * course's review form, and certificate news (issued, reinstated, withdrawn)
 * to the learner's certificates, where a withdrawn one shows why. A course
 * announcement links to its course; a general one leads nowhere.
 */
export function notificationHref(notification: IApiNotification): string | null {
  const slug = notification.data?.courseSlug
  if (notification.type === "rating_requested" && typeof slug === "string" && slug) {
    return `/courses/${encodeURIComponent(slug)}#ratings`
  }
  if (notification.type === "announcement" && typeof slug === "string" && slug) {
    return `/courses/${encodeURIComponent(slug)}`
  }
  if (notification.type === "certificate_issued" || notification.type === "certificate_revoked") {
    return "/certificates"
  }
  return null
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

  const href = notificationHref(notification)
  const className = cn(
    "flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted",
    unread && "bg-violet-50/70 dark:bg-violet-500/10"
  )
  const markRead = () => unread && onRead?.(notification.id)

  const content = (
    <>
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
    </>
  )

  return href ? (
    <Link
      href={href}
      data-testid="notification-item"
      data-unread={unread}
      onClick={markRead}
      className={className}
    >
      {content}
    </Link>
  ) : (
    <button
      type="button"
      data-testid="notification-item"
      data-unread={unread}
      onClick={markRead}
      className={className}
    >
      {content}
    </button>
  )
}
