"use client"

import { Loader2, Trophy, TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Card } from "@/components/ui/card"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { LeaderboardRow } from "@/components/leaderboard/leaderboard-row"
import { useLeaderboard } from "@/hooks/utils/use-leaderboard"
import { formatNumber } from "@/utils/functions/format"
import { ordinal } from "@/utils/functions/leaderboard"

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard")
  const { board, error } = useLeaderboard()

  /* Only worth pinning the learner's own row below the list when it isn't
     already visible in it. */
  const meOffPage =
    board?.me && !board.entries.some((entry) => entry.isViewer)
      ? board.me
      : null

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {board === null && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {error && (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-5 dark:border-amber-500/25 dark:bg-amber-500/10">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          </Card>
        )}

        {board?.me && (
          <AnimateIn animation="fade-up" delay={0.08}>
            <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-foreground">
                  {t("yourRank", {
                    rank: ordinal(board.me.rank),
                    total: formatNumber(board.total),
                  })}
                </p>
                <TypographyMuted className="mt-0.5 text-sm">
                  {t("yourXp", { xp: formatNumber(board.me.xp) })}
                </TypographyMuted>
              </div>
              <Trophy className="size-6 text-amber-500" />
            </Card>
          </AnimateIn>
        )}

        {board?.entries.length === 0 && !error && (
          <AnimateIn animation="fade-up" delay={0.1}>
            <Card className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="rounded-2xl bg-amber-100 p-3 dark:bg-amber-500/15">
                <Trophy className="size-7 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t("emptyTitle")}
                </p>
                <TypographyMuted className="mt-1 text-sm">
                  {t("emptyBody")}
                </TypographyMuted>
              </div>
            </Card>
          </AnimateIn>
        )}

        {board && board.entries.length > 0 && (
          <div className="space-y-2">
            {board.entries.map((entry, index) => (
              <AnimateIn
                key={entry.userId}
                animation="fade-up"
                delay={Math.min(0.04 * index, 0.4)}
              >
                <LeaderboardRow entry={entry} />
              </AnimateIn>
            ))}

            {meOffPage && (
              <>
                <p className="py-1 text-center text-xs text-muted-foreground">
                  ···
                </p>
                <LeaderboardRow entry={meOffPage} />
              </>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
