"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import gsap from "gsap"
import { ArrowRight, EyeIcon, EyeClosedIcon, LockIcon, MailIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ModernLoginSignup from "@/components/ui/modern-login-signup"
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
      gsap.from("[data-auth-field]", {
        opacity: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
      })
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
    <div ref={formRef} className="flex h-svh w-full items-center justify-center px-4 pb-4 pt-20 sm:px-6">
      <ModernLoginSignup
        mode="login"
        switchHref={withNext("/register", searchParams.get("next"))}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full space-y-4"
        >
          <div className="space-y-3">
            <div data-auth-field>
              <Input
                label={t("emailLabel")}
                prefix={<MailIcon />}
                placeholder={t("emailPlaceholder")}
                type="email"
                autoComplete="email"
                validationMessage={errors.email?.message ? tv(errors.email.message) : undefined}
                className="auth-input"
                {...register("email")}
              />
            </div>
            <div data-auth-field>
              <Input
                label={t("passwordLabel")}
                prefix={<LockIcon />}
                placeholder={t("passwordPlaceholder")}
                type={passwordVisible ? "text" : "password"}
                autoComplete="current-password"
                validationMessage={errors.password?.message ? tv(errors.password.message) : undefined}
                className="auth-input"
                {...register("password")}
                suffix={
                  passwordVisible ? (
                    <button
                      type="button"
                      aria-label={t("hidePassword")}
                      onClick={() => setPasswordVisible(false)}
                      className="rounded-md p-0.5 transition-colors hover:text-foreground"
                    >
                      <EyeClosedIcon className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={t("showPassword")}
                      onClick={() => setPasswordVisible(true)}
                      className="rounded-md p-0.5 transition-colors hover:text-foreground"
                    >
                      <EyeIcon className="size-4" />
                    </button>
                  )
                }
              />
            </div>

            <div data-auth-field className="-mt-1 text-right">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
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
                className="auth-email-button w-full transition-transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t("signingIn")}
                  </>
                ) : (
                  <>
                    {t("loginButton")}
                    <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          </div>

        </form>
      </ModernLoginSignup>
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
