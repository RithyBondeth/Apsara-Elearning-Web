/** Mirrors the badges table row `GET /badge` returns. */
export interface IApiBadge {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  xpRequired?: number | null
  createdAt: string
  updatedAt: string
}

/** Mirrors the joined row `GET /user/me/badges` returns — earned badges only. */
export interface IApiEarnedBadge {
  badgeId: string
  name: string
  description?: string | null
  icon?: string | null
  xpRequired?: number | null
  earnedAt: string
}
