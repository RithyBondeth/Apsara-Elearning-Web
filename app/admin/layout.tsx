import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getMe } from "@/lib/api/user"
import { AdminShell } from "@/components/admin/admin-shell"

/**
 * Resolves the admin claim before any admin screen renders.
 *
 * `proxy.ts` can only see that a session cookie exists — being an admin is not
 * knowable from a cookie, so it is resolved here from `/user/me`. A non-admin
 * (or an unreadable session) is sent to the dashboard rather than shown an
 * admin shell whose every request would 403.
 *
 * This is routing, not authorization. The gateway's `AdminGuard` runs on every
 * admin-gateway route and is what actually protects the data; skipping this
 * redirect would buy an attacker an empty layout, not access.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  let isAdmin = false

  try {
    isAdmin = (await getMe()).isAdmin
  } catch {
    /* Expired or missing session. `proxy.ts` already redirects anonymous
       visitors to /login; anything reaching here with a dead session is
       treated as not-an-admin. */
    isAdmin = false
  }

  if (!isAdmin) redirect("/dashboard")

  return <AdminShell>{children}</AdminShell>
}
