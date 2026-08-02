"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import gsap from "gsap"
import { EyeIcon, EyeClosedIcon, LockIcon, MailIcon, Globe, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AuthShowcase } from "@/components/auth/auth-showcase"
import { BrandLogo } from "@/components/utils/brand-logo"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { loginRequest, resendVerificationRequest } from "@/lib/auth/client"
import { safeNext, withNext } from "@/lib/auth/next-param"
import { loginSchema, type TLoginInput } from "@/lib/validation/auth"

function LoginInner() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  /* Set when the gateway rejects an unverified account — swaps the form error
     for a resend prompt keyed off the email just attempted. */
  const [unverified, setUnverified] = useState(false)
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLDivElement>(null)
  const showcaseSubjects = t.raw("loginShowcaseSubjects") as string[]

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TLoginInput>({ resolver: zodResolver(loginSchema) })

  /* Entrance timeline — logo pops, then the form cascades up */
  useEffect(() => {
    const root = formRef.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from("[data-auth-logo]", {
        opacity: 0,
        scale: 0.7,
        y: -24,
        duration: 0.7,
        ease: "back.out(1.8)",
      }).from(
        "[data-auth-field]",
        { opacity: 0, y: 28, duration: 0.6, stagger: 0.1 },
        "-=0.25"
      )
    }, root)
    return () => ctx.revert()
  }, [])

  const onSubmit = async (values: TLoginInput) => {
    setUnverified(false)
    const result = await loginRequest(values)

    if (result.ok) {
      /* middleware bounces authed users off /login, so a full navigation to the
         intended destination re-runs it with the fresh cookie in place. */
      router.replace(safeNext(searchParams.get("next")) ?? "/dashboard")
      return
    }

    if (result.emailNotVerified) {
      setUnverified(true)
      return
    }

    toast.error(result.message || t("loginFailed"))
  }

  const resend = async () => {
    await resendVerificationRequest(getValues("email"))
    toast.success(t("resent"))
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center px-4 py-6 sm:px-6">
      <div className="auth-shell flex min-h-[42rem]">
        {/* ── Form panel ── */}
        <div
          ref={formRef}
          className="auth-form-panel relative flex flex-1 flex-col items-center justify-center px-7 py-10 sm:px-10"
        >

        <div data-auth-logo className="relative mb-10">
          <BrandLogo size="lg" />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-sm space-y-6"
        >
          <div data-auth-field className="text-center">
            <TypographyH3 className="text-2xl font-bold">
              {t("loginTitle")}
            </TypographyH3>
          </div>

          <div className="space-y-3">
            <div data-auth-field>
              <Input
                prefix={<MailIcon />}
                placeholder={t("emailPlaceholder")}
                type="email"
                autoComplete="email"
                validationMessage={errors.email?.message ? tv(errors.email.message) : undefined}
                className="bg-background/70 backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-[0_0_24px_-8px_rgba(35,131,226,0.5)]"
                {...register("email")}
              />
            </div>
            <div data-auth-field>
              <Input
                prefix={<LockIcon />}
                placeholder={t("passwordPlaceholder")}
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                validationMessage={errors.password?.message ? tv(errors.password.message) : undefined}
                className="bg-background/70 backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-[0_0_24px_-8px_rgba(35,131,226,0.5)]"
                {...register("password")}
                suffix={
                  passwordVisible ? (
                    <EyeClosedIcon
                      onClick={() => setPasswordVisible(false)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    />
                  ) : (
                    <EyeIcon
                      onClick={() => setPasswordVisible(true)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    />
                  )
                }
              />
            </div>

            <div data-auth-field className="-mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-violet-600 hover:underline dark:text-violet-400"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            {unverified && (
              <div
                data-auth-field
                className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs dark:border-amber-500/20 dark:bg-amber-500/10"
              >
                <p className="text-amber-700 dark:text-amber-300">
                  {t("emailNotVerified")}
                </p>
                <button
                  type="button"
                  onClick={resend}
                  className="mt-1 font-semibold text-amber-800 underline hover:no-underline dark:text-amber-200"
                >
                  {t("resendVerification")}
                </button>
              </div>
            )}

            <div data-auth-field>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-shine w-full transition-all hover:-translate-y-0.5 hover:shadow-[0_0_28px_-6px_rgba(35,131,226,0.6)]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t("signingIn")}
                  </>
                ) : (
                  t("loginButton")
                )}
              </Button>
            </div>
          </div>

          <div data-auth-field>
            <TypographyMuted className="text-center text-sm">
              {t("noAccount")}{" "}
              <Link
                href={withNext("/register", searchParams.get("next"))}
                className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                {t("signUp")}
              </Link>
            </TypographyMuted>
          </div>
        </form>
        </div>

        {/* ── Decorative panel ── */}
        <AuthShowcase
          side="right"
          icon={<Globe className="relative size-8 text-white" />}
          title={t("loginShowcaseTitle")}
          description={t("loginShowcaseDescription")}
        >
          <div className="flex flex-wrap gap-2">
            {showcaseSubjects.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-50 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </AuthShowcase>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  )
}
