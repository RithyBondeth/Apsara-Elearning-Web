"use client"

import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar } from "@/components/utils/avatar"
import { formatNumber, xpToLevel } from "@/utils/functions/format"
import { medalFor, rankTone } from "@/utils/functions/leaderboard"
import type { IApiLeaderboardEntry } from "@/utils/interfaces/leaderboard/api.interface"

/**
 * One row of the leaderboard.
 *
 * Deliberately free of translated copy so it renders from props alone — the
 * page above it owns the headings and labels.
 */
export function LeaderboardRow({
  entry,
  className,
}: {
  entry: IApiLeaderboardEntry
  className?: string
}) {
  const medal = medalFor(entry.rank)

  return (
    <div
      data-testid="leaderboard-row"
      data-rank={entry.rank}
      className={cn(
        "flex items-center gap-4 rounded-xl border bg-card p-4",
        // The viewer's own row is pulled out of the visual noise.
        entry.isViewer && "border-violet-300 bg-violet-50/60 dark:border-violet-500/40 dark:bg-violet-500/10",
        className
      )}
    >
      <div
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold tabular-nums",
          rankTone(entry.rank)
        )}
      >
        {medal ?? entry.rank}
      </div>

      <Avatar preset={entry.avatar} size="sm" />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">
          {entry.displayName}
        </p>
        <p className="text-xs text-muted-foreground">{xpToLevel(entry.xp)}</p>
      </div>

      {entry.streak > 0 && (
        <span
          className="flex items-center gap-1 text-xs text-muted-foreground tabular-nums"
          title={`${entry.streak}-day streak`}
        >
          <Flame className="size-3.5 text-orange-500" />
          {entry.streak}
        </span>
      )}

      <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
        {formatNumber(entry.xp)} XP
      </span>
    </div>
  )
}
