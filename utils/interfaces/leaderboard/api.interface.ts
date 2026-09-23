/** Mirrors `LeaderboardEntryDTO` / `LeaderboardResponseDTO` on the api-gateway. */

export interface IApiLeaderboardEntry {
  /** Competition rank — tied XP shares a rank. */
  rank: number
  userId: string
  /** First name plus last initial; the API never sends a full surname or email. */
  displayName: string
  avatar?: string | null
  xp: number
  streak: number
  /** True for the signed-in learner's own row. */
  isViewer: boolean
}

export interface IApiLeaderboard {
  entries: IApiLeaderboardEntry[]
  /** The learner's own row, present even when they rank below the page. */
  me: IApiLeaderboardEntry | null
  /** Total ranked learners, so the page can show "of N". */
  total: number
}
