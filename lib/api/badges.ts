import { apiGet } from "./client"
import type { IApiBadge, IApiEarnedBadge } from "@/utils/interfaces/badge/api.interface"

/** The full catalog, ordered by xpRequired — public, no session needed. */
export const getAllBadges = () => apiGet<IApiBadge[]>("/badge")

/** The student's earned badges — requires an authenticated session. */
export const getMyBadges = () => apiGet<IApiEarnedBadge[]>("/user/me/badges")
