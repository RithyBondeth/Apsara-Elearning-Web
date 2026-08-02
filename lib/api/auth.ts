import { apiPost } from "./client"

/**
 * Changes the password of the signed-in user. Goes through the authenticated
 * proxy (`/api/proxy/*`), which attaches the bearer token — unlike the
 * forgot/reset flow, which is anonymous and uses the BFF auth routes.
 *
 * The gateway returns 401 if `currentPassword` is wrong.
 */
export const changePassword = (currentPassword: string, newPassword: string) =>
  apiPost<{ message: string }>("/auth/change-password", {
    currentPassword,
    newPassword,
  })
