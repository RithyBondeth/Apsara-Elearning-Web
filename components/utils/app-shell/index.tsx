"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Settings,
  Bell,
  CreditCard,
  LogIn,
  LogOut,
  Home,
  BookOpen,
  Sparkles,
  Award,
  History,
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
import { useHasSession } from "@/components/utils/session/session-provider"
import { withNext } from "@/lib/auth/next-param"
import { levelFromXp, xpForNextLevel } from "@/utils/functions/format"
import type { IWithChildren } from "@/utils/interfaces"

/* ── Nav items ────────────────────────────────────────────────────────── */

const NAV_ITEMS = [
  { icon: Home, key: "dashboard", href: "/dashboard" },
  { icon: BookOpen, key: "courses", href: "/courses" },
  { icon: Sparkles, key: "aiMentor", href: "/tutor" },
  { icon: Award, key: "certificates", href: "/certificates" },
  { icon: History, key: "activity", href: "/activity" },
  { icon: CreditCard, key: "pricing", href: "/pricing" },
] as const

/* ── Component ────────────────────────────────────────────────────────── */

export function AppShell({ children }: IWithChildren) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const tNav = useTranslations("nav")
  const tDash = useTranslations("dashboard")
  const tCommon = useTranslations("common")
  const profile = useProfile()
  const stats = useProfileStats()
  const signOut = useSignOut()

  /* `/courses` and `/pricing` are public but still render this shell, so every
     authenticated fetch below is gated — otherwise an anonymous visitor pays
     for three guaranteed 401s and sees an empty student card. */
  const hasSession = useHasSession()

  useHydrateUserStats(hasSession)

  const level = levelFromXp(stats.xp)
  const xpPct = (stats.xp / xpForNextLevel(stats.xp)) * 100
  const totalLessonsDone = useLessonsDone(hasSession) ?? 0
  const loginHref = withNext("/login", pathname)

  /* First matching nav key wins — prevents Playground + AI Mentor both lighting up on /learn */
  const activeKey = NAV_ITEMS.find((item) => item.href === pathname)?.key

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* ── SIDEBAR ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} `}
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
          <BrandLogo size="sm" />
        </div>

        {/* Student card — or a sign-in prompt when browsing anonymously */}
        {!hasSession ? (
          <div className="card-surface mx-3 mt-4 rounded-2xl border border-violet-200 p-3.5 dark:border-violet-500/20">
            <div className="mb-1 text-sm font-semibold text-foreground">
              {tCommon("guestTitle")}
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-muted-foreground">
              {tCommon("guestPrompt")}
            </p>
            <div className="space-y-2">
              <Link
                href={loginHref}
                className="gradient-bg-primary flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white transition-transform motion-safe:hover:scale-[1.02]"
              >
                <LogIn className="size-4" />
                {tNav("signIn")}
              </Link>
              <Link
                href="/register"
                className="flex w-full items-center justify-center rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                {tNav("startFree")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="card-surface mx-3 mt-4 rounded-2xl border border-violet-200 p-3.5 dark:border-violet-500/20">
            <Link
              href="/profile"
              className="group mb-3 flex items-center gap-3"
            >
              <Avatar
                preset={profile.avatar}
                size="md"
                className="transition-transform duration-300 motion-safe:group-hover:scale-110"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-violet-600 dark:group-hover:text-violet-400">
                  {profile.name}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {profile.nameKh}
                </div>
              </div>
            </Link>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {tDash("levelLabel", { level })}
              </span>
              <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                {tDash("lessonsCount", { count: totalLessonsDone })}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="gradient-bg-primary h-full rounded-full transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = item.key === activeKey
            return (
              <Link
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "border border-violet-200 bg-violet-100 font-medium text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
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

        {/* Bottom actions — settings and sign-out need a session to mean anything */}
        <div className="space-y-0.5 border-t border-border px-3 pt-3 pb-4">
          {!hasSession ? (
            <Link
              href={loginHref}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
            >
              <LogIn className="size-4" />
              {tNav("signIn")}
            </Link>
          ) : (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground"
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
                <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/5 dark:hover:text-red-400">
                  <LogOut className="size-4" />
                  {tDash("signOut")}
                </button>
              </ConfirmDialog>
            </>
          )}
        </div>
      </aside>

      {/* ── MAIN COLUMN ── */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/90 px-6 backdrop-blur-xl">
          {/* Mobile hamburger */}
          <button
            className="rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <div className="w-5 space-y-1.5">
              <div className="h-0.5 rounded bg-current" />
              <div className="h-0.5 rounded bg-current" />
              <div className="h-0.5 w-3 rounded bg-current" />
            </div>
          </button>

          {/* Search */}
          <CourseSearch label={tDash("search")} />

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {hasSession ? (
              <>
                <button className="relative rounded-xl p-2 text-muted-foreground transition-all hover:bg-muted hover:text-foreground">
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
              </>
            ) : (
              <Link
                href={loginHref}
                className="gradient-bg-primary flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium text-white transition-transform motion-safe:hover:scale-[1.03]"
              >
                <LogIn className="size-4" />
                {tNav("signIn")}
              </Link>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="study-surface flex-1 overflow-y-auto p-6">
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
