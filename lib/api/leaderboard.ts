import { apiGet } from "./client"
import type { IApiLeaderboard } from "@/utils/interfaces/leaderboard/api.interface"

/**
 * Top learners by XP plus the caller's own standing.
 *
 * Authenticated — the board names learners, so the gateway keeps it behind a
 * session rather than exposing it publicly.
 */
export const getLeaderboard = (limit?: number) =>
  apiGet<IApiLeaderboard>(
    limit ? `/leaderboard?limit=${limit}` : "/leaderboard"
  )
