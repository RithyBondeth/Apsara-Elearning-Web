"use client"

import { Bell, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NotificationItem } from "./notification-item"
import { useNotifications } from "@/hooks/utils/use-notifications"

/**
 * The header bell: unread count badge plus a popover feed.
 *
 * Rendered only for a signed-in learner — the endpoint needs a session.
 */
export function NotificationBell() {
  const t = useTranslations("notifications")
  const { items, unreadCount, markRead, markAllRead } = useNotifications(10)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={t("ariaLabel", { count: unreadCount })}
          className="relative rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4.5" />
          {/* Only show the dot when something is actually unread — the old
              header showed it permanently. */}
          {unreadCount > 0 && (
            <span
              data-testid="unread-badge"
              className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[10px] font-semibold text-white tabular-nums"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-2.5">
          <p className="text-sm font-semibold text-foreground">{t("title")}</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              {t("markAllRead")}
            </button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {items === null && (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          )}

          {items?.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {t("empty")}
            </p>
          )}

          {items?.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => void markRead(id)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
