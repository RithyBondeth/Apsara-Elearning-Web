"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Settings, Bell,
  LogOut, Home, BookOpen,
} from "lucide-react"
import { useTranslations } from "next-intl"
import { Avatar } from "@/components/utils/avatar"
import { BrandLogo } from "@/components/utils/brand-logo"
import { CourseSearch } from "@/components/utils/course-search"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { ThemeToggle } from "@/components/utils/themes/theme-toggle"
import { LanguageSwitcher } from "@/components/utils/language-switcher"
import { useProfile } from "@/hooks/utils/use-profile"
import { useProfileStats } from "@/hooks/utils/use-profile-stats"
import { useHydrateUserStats } from "@/hooks/utils/use-hydrate-user-stats"
import { useLessonsDone } from "@/hooks/utils/use-lessons-done"
import { useSignOut } from "@/hooks/utils/use-sign-out"
import { levelFromXp, xpForNextLevel } from "@/utils/functions/format"
import type { IWithChildren } from "@/utils/interfaces"

/* ── Nav items ────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: Home,     key: "dashboard", href: "/dashboard" },
  { icon: BookOpen, key: "courses",   href: "/courses"   },
] as const

/* ── Component ────────────────────────────────────────────────────────── */

export function AppShell({ children }: IWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const tNav    = useTranslations("nav")
  const tDash   = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const profile = useProfile()
  const stats   = useProfileStats()
  const signOut = useSignOut()

  useHydrateUserStats()

  const level = levelFromXp(stats.xp)
  const xpPct = (stats.xp / xpForNextLevel(stats.xp)) * 100
  const totalLessonsDone = useLessonsDone() ?? 0

  /* First matching nav key wins — prevents Playground + AI Mentor both lighting up on /learn */
  const activeKey = NAV_ITEMS.find((item) => item.href === pathname)?.key

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        border-r border-border bg-sidebar text-sidebar-foreground
        transition-transform duration-300
        lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="flex items-center px-5 h-16 border-b border-border shrink-0">
          <BrandLogo size="sm" />
        </div>

        {/* Student card */}
        <div className="mx-3 mt-4 p-3.5 rounded-2xl card-surface border border-violet-200 dark:border-violet-500/20">
          <Link href="/profile" className="flex items-center gap-3 mb-3 group">
            <Avatar
              preset={profile.avatar}
              size="md"
              className="transition-transform duration-300 motion-safe:group-hover:scale-110"
            />
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {profile.name}
              </div>
              <div className="text-[10px] text-muted-foreground truncate">{profile.nameKh}</div>
            </div>
          </Link>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">{tDash("levelLabel", { level })}</span>
            <span className="text-violet-600 dark:text-violet-400 font-semibold text-xs">
              {tDash("lessonsCount", { count: totalLessonsDone })}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gradient-bg-primary transition-all"
              style={{ width: `${xpPct}%` }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeKey
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 font-medium border border-violet-200 dark:border-violet-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
              >
                <item.icon className="size-4 shrink-0" />
                {tNav(item.key)}
                {isActive && (
                  <div className="ml-auto size-1.5 rounded-full bg-violet-500 dark:bg-violet-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 border-t border-border pt-3 space-y-0.5">
          <Link
            href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all"
          >
            <Settings className="size-4" />
            {tDash("settings")}
          </Link>
          <ConfirmDialog
            title={tCommon("signOutTitle")}
            description={tCommon("signOutDesc")}
            confirmLabel={tCommon("signOutConfirm")}
            variant="danger"
            icon={<LogOut className="size-4.5" />}
            onConfirm={signOut}
          >
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 transition-all">
              <LogOut className="size-4" />
              {tDash("signOut")}
            </button>
          </ConfirmDialog>
        </div>
      </aside>

      {/* ── MAIN COLUMN ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-16 border-b border-border bg-background/90 backdrop-blur-xl flex items-center gap-4 px-6 shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className="space-y-1.5 w-5">
              <div className="h-0.5 bg-current rounded" />
              <div className="h-0.5 bg-current rounded" />
              <div className="h-0.5 w-3 bg-current rounded" />
            </div>
          </button>

          {/* Search */}
          <CourseSearch label={tDash("search")} />

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <button className="relative p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <Bell className="size-4.5" />
              <div className="absolute top-1.5 right-1.5 size-2 rounded-full bg-violet-500" />
            </button>
            <Link href="/profile" title={tDash("settings")}>
              <Avatar
                preset={profile.avatar}
                size="sm"
                className="transition-transform duration-300 motion-safe:hover:scale-110"
              />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 study-surface">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
