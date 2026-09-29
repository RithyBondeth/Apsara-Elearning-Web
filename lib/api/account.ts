import { apiGet, apiPost } from "./client"

/** Shape of `POST /account/deletion`. */
export interface IAccountDeletion {
  /** ISO date-time: the account is deleted after this unless the owner signs in. */
  deleteAfter: string
}

/**
 * Schedules the signed-in account for deletion after the grace period. The
 * gateway re-checks the password (401 if wrong), signs out every session and
 * stops subscription renewal.
 */
export const requestAccountDeletion = (password: string) =>
  apiPost<IAccountDeletion>("/account/deletion", { password })

/** Everything the platform stores about the signed-in account, as JSON. */
export const exportMyData = () =>
  apiGet<Record<string, unknown>>("/account/export")
