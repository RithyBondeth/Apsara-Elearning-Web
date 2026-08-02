import { apiGet, apiPatch } from "./client"
import type { IApiUser } from "@/utils/interfaces/user/api.interface"
import type { TAvatarPreset } from "@/utils/constants/avatar.constant"

/** Requires an authenticated session — the gateway resolves the id from the JWT. */
export const getMe = () => apiGet<IApiUser>("/user/me")

/** Mirrors UpdateUserRequestDTO — every field optional; omit rather than send "". */
export interface IUpdateMePayload {
  firstName?: string
  lastName?: string
  gender?: string
  phone?: string
  /** ISO date string (YYYY-MM-DD). */
  dateOfBirth?: string
}

export const updateMe = (payload: IUpdateMePayload) =>
  apiPatch<IApiUser>("/user/me", payload)

/** The preset key is validated against AVATAR_PRESETS on the server too. */
export const updateMyAvatar = (avatar: TAvatarPreset) =>
  apiPatch<IApiUser>("/user/me/avatar", { avatar })
