import type { IApiUser } from "@/utils/interfaces/user/api.interface"

/** "First Last", falling back to the email prefix for accounts without names. */
export function displayNameOf(user: IApiUser): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim()
  return name || user.email.split("@")[0]
}
