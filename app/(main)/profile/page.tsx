"use client"

import { useEffect, useState } from "react"
import {
  Check,
  Flame,
  Globe,
  KeyRound,
  LogOut,
  Minus,
  Moon,
  Plus,
  Smile,
  Sun,
  Target,
  Trophy,
  User,
  Zap,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AppShell } from "@/components/utils/app-shell"
import { SubscriptionSummary } from "@/components/subscription/subscription-summary"
import { Avatar } from "@/components/utils/avatar"
import { ConfirmDialog } from "@/components/utils/confirm-dialog"
import { ChangePasswordDialog } from "@/components/utils/change-password-dialog"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { CountUp } from "@/components/utils/animations/count-up"
import { GrowBar } from "@/components/utils/animations/grow-bar"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { useProfile } from "@/hooks/utils/use-profile"
import { useProfileStats } from "@/hooks/utils/use-profile-stats"
import { useHydrated } from "@/hooks/utils/use-hydrated"
import { useProfileStore } from "@/stores/profiles/profile-store"
import { useLanguageStore } from "@/stores/languages/language-store"
import { useSignOut } from "@/hooks/utils/use-sign-out"
import { levelFromXp, xpForNextLevel } from "@/utils/functions/format"
import { displayNameOf } from "@/utils/functions/user"
import {
  AVATAR_PRESETS,
  toAvatarPreset,
} from "@/utils/constants/avatar.constant"
import type { TAvatarPreset } from "@/utils/constants/avatar.constant"
import { getMe, updateMe, updateMyAvatar } from "@/lib/api/user"
import type { IUpdateMePayload } from "@/lib/api/user"
import type { IApiUser } from "@/utils/interfaces/user/api.interface"

const GOAL_MIN = 1
const GOAL_MAX = 14

/** The editable slice of GET /user/me, shaped for the form (no nulls). */
interface IProfileForm {
  firstName: string
  lastName: string
  gender: string
  dateOfBirth: string
  phone: string
}

const toForm = (user: IApiUser): IProfileForm => ({
  firstName: user.firstName ?? "",
  lastName: user.lastName ?? "",
  gender: user.gender ?? "",
  dateOfBirth: user.dateOfBirth ?? "",
  phone: user.phone ?? "",
})

/** Only send fields the student actually filled — "" fails DTO validation. */
const toPayload = (form: IProfileForm): IUpdateMePayload =>
  Object.fromEntries(
    Object.entries(form)
      .map(([k, v]) => [k, v.trim()])
      .filter(([, v]) => v !== "")
  )

export default function ProfilePage() {
  const t = useTranslations("profile")
  const tCommon = useTranslations("common")
  const signOut = useSignOut()

  const profile = useProfile()
  const earnedStats = useProfileStats()
  const updateProfile = useProfileStore((s) => s.updateProfile)

  const { language, setLanguage } = useLanguageStore()
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()

  /* The form edits the real account — seeded from GET /user/me, saved back
     with PATCH /user/me. `baseline` is the last server state for dirty checks. */
  const [baseline, setBaseline] = useState<IProfileForm | null>(null)
  const [form, setForm] = useState<IProfileForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [avatarPending, setAvatarPending] = useState<TAvatarPreset | null>(null)

  useEffect(() => {
    let cancelled = false
    getMe()
      .then((user) => {
        if (cancelled) return
        setBaseline(toForm(user))
        setForm(toForm(user))
      })
      .catch(() => {
        /* Session expired — middleware bounces to login on next navigation. */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const dirty =
    form !== null &&
    baseline !== null &&
    (Object.keys(form) as (keyof IProfileForm)[]).some(
      (k) => form[k] !== baseline[k]
    )

  const save = async () => {
    if (!form || saving) return
    setSaving(true)
    setSaveError(false)
    try {
      const user = await updateMe(toPayload(form))
      setBaseline(toForm(user))
      setForm(toForm(user))
      /* Keep the store (AppShell, dashboard greeting) in step. */
      updateProfile({ name: displayNameOf(user), email: user.email })
      setSaved(true)
    } catch {
      setSaveError(true)
    } finally {
      setSaving(false)
    }
  }

  const pickAvatar = async (preset: TAvatarPreset) => {
    if (avatarPending) return
    setAvatarPending(preset)
    setSaveError(false)
    try {
      const user = await updateMyAvatar(preset)
      updateProfile({ avatar: toAvatarPreset(user.avatar) })
    } catch {
      setSaveError(true)
    } finally {
      setAvatarPending(null)
    }
  }

  useEffect(() => {
    if (!saved) return
    const id = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(id)
  }, [saved])

  const setGoal = (n: number) =>
    updateProfile({ weeklyGoal: Math.min(GOAL_MAX, Math.max(GOAL_MIN, n)) })

  const level = levelFromXp(earnedStats.xp)
  const xpNext = xpForNextLevel(earnedStats.xp)
  const xpPct = Math.round((earnedStats.xp / xpNext) * 100)
  const isDark = resolvedTheme === "dark"

  /* Resolve through the same fallback the tile renders with, so an account
     saved before presets existed highlights the avatar it actually shows. */
  const currentAvatar = toAvatarPreset(profile.avatar)

  const stats = [
    {
      icon: Trophy,
      label: t("statLevel"),
      value: level,
      color:
        "bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400",
    },
    {
      icon: Zap,
      label: t("statXp"),
      value: earnedStats.xp,
      color:
        "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      locale: true,
    },
    {
      icon: Flame,
      label: t("statStreak"),
      value: earnedStats.streak,
      color:
        "bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400",
    },
  ]

  const field = (
    key: Exclude<keyof IProfileForm, "gender">,
    label: string,
    type = "text"
  ) => (
    <div>
      <label
        htmlFor={key}
        className="mb-1.5 block text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      <Input
        id={key}
        type={type}
        value={form?.[key] ?? ""}
        disabled={form === null}
        onChange={(e) => form && setForm({ ...form, [key]: e.target.value })}
        className="h-auto rounded-xl px-3.5 py-2.5 focus-within:border-violet-400 focus-within:ring-violet-500/15 dark:focus-within:border-violet-500/60"
      />
    </div>
  )

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Page header */}
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {/* Identity hero */}
        <AnimateIn animation="fade-up" delay={0.1}>
          <Card className="flex-row items-center gap-5 rounded-2xl border-violet-200 p-6 dark:border-violet-500/20">
            <Avatar preset={profile.avatar} size="lg" />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold text-foreground">
                {profile.name}
              </div>
              {profile.nameKh && (
                <TypographyMuted className="truncate text-xs">
                  {profile.nameKh}
                </TypographyMuted>
              )}
              <TypographyMuted className="mt-0.5 truncate text-xs">
                {profile.email}
              </TypographyMuted>
            </div>
          </Card>
        </AnimateIn>

        <AnimateIn animation="fade-up" delay={0.12}>
          <SubscriptionSummary />
        </AnimateIn>

        {/* Avatar picker — applies on click, like a Netflix profile */}
        <AnimateIn animation="fade-up" delay={0.13}>
          <Card className="rounded-2xl p-5">
            <div className="mb-1 flex items-center gap-2.5">
              <Smile className="size-4 text-muted-foreground" />
              <TypographyH3 className="text-base font-semibold text-foreground">
                {t("avatarTitle")}
              </TypographyH3>
            </div>
            <TypographyMuted className="mb-4 text-xs">
              {t("avatarDesc")}
            </TypographyMuted>

            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
              {AVATAR_PRESETS.map((preset) => {
                const active = currentAvatar === preset
                return (
                  <button
                    key={preset}
                    onClick={() => pickAvatar(preset)}
                    disabled={avatarPending !== null}
                    aria-pressed={active}
                    aria-label={t(`avatars.${preset}`)}
                    title={t(`avatars.${preset}`)}
                    className={`group relative rounded-2xl p-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      active
                        ? "ring-2 ring-primary"
                        : "ring-1 ring-transparent hover:ring-border"
                    } ${avatarPending === preset ? "opacity-60" : ""}`}
                  >
                    <Avatar
                      preset={preset}
                      size="lg"
                      className="aspect-square size-full rounded-xl transition-transform duration-300 motion-safe:group-hover:scale-105"
                    />
                    {active && (
                      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary ring-2 ring-background">
                        <Check className="size-3 text-white" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </Card>
        </AnimateIn>

        {/* Learning stats */}
        <AnimateIn animation="fade-up" delay={0.15}>
          <Card className="rounded-2xl p-5">
            <TypographyH3 className="mb-4 text-base font-semibold text-foreground">
              {t("statsTitle")}
            </TypographyH3>

            <div className="mb-5 grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, label, value, color, locale }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-wide text-muted-foreground uppercase">
                      {label}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      <CountUp
                        to={value}
                        duration={1.2}
                        ease="power3.out"
                        locale={locale}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* XP toward the next level */}
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {t("xpProgress", { level: level + 1 })}
              </span>
              <span className="font-semibold text-foreground">
                {earnedStats.xp.toLocaleString()} / {xpNext.toLocaleString()}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <GrowBar
                to={xpPct}
                delay={0.3}
                className="gradient-bg-primary h-full rounded-full"
              />
            </div>
          </Card>
        </AnimateIn>

        {/* Profile information */}
        <AnimateIn animation="fade-up" delay={0.2}>
          <Card className="rounded-2xl p-5">
            <div className="mb-1 flex items-center gap-2.5">
              <User className="size-4 text-muted-foreground" />
              <TypographyH3 className="text-base font-semibold text-foreground">
                {t("infoTitle")}
              </TypographyH3>
            </div>
            <TypographyMuted className="mb-4 text-xs">
              {t("infoDesc")}
            </TypographyMuted>

            {form === null ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {field("firstName", t("fieldFirstName"))}
                {field("lastName", t("fieldLastName"))}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                    {t("fieldGender")}
                  </label>
                  <Select
                    value={form.gender || undefined}
                    onValueChange={(v) => setForm({ ...form, gender: v })}
                  >
                    <SelectTrigger className="h-auto w-full rounded-xl px-3.5 py-2.5">
                      <SelectValue placeholder={t("genderPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">{t("gender_male")}</SelectItem>
                      <SelectItem value="Female">
                        {t("gender_female")}
                      </SelectItem>
                      <SelectItem value="Other">{t("gender_other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {field("dateOfBirth", t("fieldDateOfBirth"), "date")}
                {field("phone", t("fieldPhone"), "tel")}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <Button
                onClick={save}
                disabled={!dirty || saving}
                className="btn-shine"
              >
                {saving ? t("saving") : t("save")}
              </Button>
              {dirty && !saving && (
                <Button
                  onClick={() => setForm(baseline)}
                  variant="ghost"
                  className="text-muted-foreground"
                >
                  {t("cancel")}
                </Button>
              )}
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="size-4" />
                  {t("saved")}
                </span>
              )}
              {saveError && (
                <span className="text-sm text-destructive">
                  {t("saveError")}
                </span>
              )}
            </div>
          </Card>
        </AnimateIn>

        {/* Weekly goal */}
        <AnimateIn animation="fade-up" delay={0.25}>
          <Card className="rounded-2xl p-5">
            <div className="mb-1 flex items-center gap-2.5">
              <Target className="size-4 text-muted-foreground" />
              <TypographyH3 className="text-base font-semibold text-foreground">
                {t("goalTitle")}
              </TypographyH3>
            </div>
            <TypographyMuted className="mb-4 text-xs">
              {t("goalDesc")}
            </TypographyMuted>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setGoal(profile.weeklyGoal - 1)}
                disabled={profile.weeklyGoal <= GOAL_MIN}
                aria-label={t("goalDecrease")}
                variant="outline"
                size="icon"
                className="size-9 rounded-xl"
              >
                <Minus className="size-4" />
              </Button>

              <div className="min-w-24 text-center">
                <div className="gradient-text text-3xl leading-none font-bold">
                  {profile.weeklyGoal}
                </div>
                <TypographyMuted className="mt-1 text-[11px]">
                  {t("goalUnit")}
                </TypographyMuted>
              </div>

              <Button
                onClick={() => setGoal(profile.weeklyGoal + 1)}
                disabled={profile.weeklyGoal >= GOAL_MAX}
                aria-label={t("goalIncrease")}
                variant="outline"
                size="icon"
                className="size-9 rounded-xl"
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </Card>
        </AnimateIn>

        {/* Preferences */}
        <AnimateIn animation="fade-up" delay={0.3}>
          <Card className="space-y-5 rounded-2xl p-5">
            <div>
              <div className="mb-1 flex items-center gap-2.5">
                <Globe className="size-4 text-muted-foreground" />
                <TypographyH3 className="text-base font-semibold text-foreground">
                  {t("prefsTitle")}
                </TypographyH3>
              </div>
              <TypographyMuted className="text-xs">
                {t("prefsDesc")}
              </TypographyMuted>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground">{t("language")}</span>
              <div className="flex shrink-0 gap-1.5 rounded-xl bg-muted p-1">
                {(["en", "km"] as const).map((code) => (
                  <Button
                    key={code}
                    onClick={() => setLanguage(code)}
                    variant="ghost"
                    size="sm"
                    className={`h-auto rounded-lg px-4 py-1.5 ${
                      language === code
                        ? "bg-background text-foreground shadow-sm hover:bg-background"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t(`language_${code}`)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-foreground">{t("theme")}</span>
              <div className="flex shrink-0 gap-1.5 rounded-xl bg-muted p-1">
                {(
                  [
                    { key: "light", icon: Sun, active: hydrated && !isDark },
                    { key: "dark", icon: Moon, active: hydrated && isDark },
                  ] as const
                ).map(({ key, icon: Icon, active }) => (
                  <Button
                    key={key}
                    onClick={() => setTheme(key)}
                    variant="ghost"
                    size="sm"
                    className={`h-auto rounded-lg px-4 py-1.5 ${
                      active
                        ? "bg-background text-foreground shadow-sm hover:bg-background"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {t(`theme_${key}`)}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </AnimateIn>

        {/* Account */}
        <AnimateIn animation="fade-up" delay={0.35}>
          <Card className="rounded-2xl p-5">
            <div className="mb-1 flex items-center gap-2.5">
              <KeyRound className="size-4 text-muted-foreground" />
              <TypographyH3 className="text-base font-semibold text-foreground">
                {t("accountTitle")}
              </TypographyH3>
            </div>
            <TypographyMuted className="mb-4 text-xs">
              {t("accountDesc")}
            </TypographyMuted>

            <div className="flex flex-wrap items-center gap-3">
              <ChangePasswordDialog>
                <Button variant="outline">
                  <KeyRound className="size-4" />
                  {t("changePassword")}
                </Button>
              </ChangePasswordDialog>
              <ConfirmDialog
                title={tCommon("signOutTitle")}
                description={tCommon("signOutDesc")}
                confirmLabel={tCommon("signOutConfirm")}
                variant="danger"
                icon={<LogOut className="size-4.5" />}
                onConfirm={signOut}
              >
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/25 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="size-4" />
                  {t("signOut")}
                </Button>
              </ConfirmDialog>
            </div>
          </Card>
        </AnimateIn>
      </div>
    </AppShell>
  )
}
