"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ArrowLeft,
  Award,
  BookOpen,
  CreditCard,
  LayoutGrid,
  Library,
  LogOut,
  Users,
} from "lucide-react"
import { BrandLogo } from "@/components/utils/brand-logo"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { ThemeToggle } from "@/components/utils/themes/theme-toggle"
import { useSignOut } from "@/hooks/utils/use-sign-out"
import type { IWithChildren } from "@/utils/interfaces"

/**
 * Chrome for the admin console.
 *
 * Deliberately not `AppShell`: that shell is built around a learner (XP bar,
 * streak, course search, student nav) and none of it means anything here. A
 * separate shell also makes it obvious at a glance which side of the platform
 * you are looking at, which matters when the actions are destructive.
 *
 * Labels are English-only. The console is for a small internal team, whereas
 * the `language/*.json` namespaces exist for the Khmer-speaking students —
 * translating admin chrome would add a maintenance burden with no reader.
 */
const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Overview", href: "/admin" },
  { icon: BookOpen, label: "Courses", href: "/admin/courses" },
  { icon: Library, label: "Taxonomy", href: "/admin/taxonomy" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Award, label: "Badges", href: "/admin/badges" },
  { icon: CreditCard, label: "Plans", href: "/admin/plans" },
] as const

export function AdminShell({ children }: IWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const signOut = useSignOut()

  /* Longest matching prefix wins, so /admin/courses/<id> keeps Courses lit
     instead of falling back to the Overview entry that every path starts with. */
  const activeHref = NAV_ITEMS.map((i) => i.href)
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .sort((a, b) => b.length - a.length)[0]

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-5">
          <BrandLogo size="sm" />
          <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-violet-700 uppercase dark:bg-violet-500/15 dark:text-violet-300">
            Admin
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === activeHref
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "border border-violet-200 bg-violet-100 font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-0.5 border-t border-border px-3 pt-3 pb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to app
          </Link>
          <ConfirmDialog
            title="Sign out?"
            description="You will need to sign in again to reach the admin console."
            confirmLabel="Sign out"
            variant="danger"
            icon={<LogOut className="size-4.5" />}
            onConfirm={signOut}
          >
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/5 dark:hover:text-red-400">
              <LogOut className="size-4" />
              Sign out
            </button>
          </ConfirmDialog>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/90 px-6 backdrop-blur-xl">
          <button
            className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle navigation"
          >
            <div className="w-5 space-y-1.5">
              <div className="h-0.5 rounded bg-current" />
              <div className="h-0.5 rounded bg-current" />
              <div className="h-0.5 w-3 rounded bg-current" />
            </div>
          </button>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        {/*
         * pb-32 keeps the last table row clear of the toast stack in the
         * bottom-right corner — a freshly created row sorts last, and without
         * the clearance the "created" toast sits on top of its own row actions
         * and swallows the click.
         */}
        <main className="flex-1 overflow-y-auto p-6 pb-32">{children}</main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
