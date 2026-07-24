"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import gsap from "gsap"
import {
  EyeIcon, EyeClosedIcon, LockIcon, MailIcon, UserIcon, PhoneIcon,
  Rocket, Check, Globe, Bot, Trophy, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { AuthShowcase } from "@/components/auth/auth-showcase"
import { BrandLogo } from "@/components/utils/brand-logo"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { TypographySmall } from "@/components/utils/typography/typography-small"
import { registerRequest } from "@/lib/auth/client"
import { withNext } from "@/lib/auth/next-param"
import { registerSchema, type TRegisterInput } from "@/lib/validation/auth"

const BENEFITS = [
  { icon: Check, text: "Free forever for students" },
  { icon: Globe, text: "Every subject, from Grade 1 to university" },
  { icon: Bot, text: "Personal AI tutor that speaks Khmer" },
  { icon: Trophy, text: "Certificates and national exam prep" },
]

const boxedField =
  "bg-background/70 backdrop-blur-sm transition-shadow duration-300 focus-within:shadow-[0_0_24px_-8px_rgba(35,131,226,0.5)]"

function RegisterInner() {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const router = useRouter()
  const searchParams = useSearchParams()
  const formRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterInput>({ resolver: zodResolver(registerSchema) })

  /* Entrance timeline — logo pops, then the form cascades up */
  useEffect(() => {
    const root = formRef.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
      tl.from("[data-auth-logo]", { opacity: 0, scale: 0.7, y: -24, duration: 0.7, ease: "back.out(1.8)" })
        .from("[data-auth-field]", { opacity: 0, y: 28, duration: 0.6, stagger: 0.09 }, "-=0.25")
    }, root)
    return () => ctx.revert()
  }, [])

  const onSubmit = async (values: TRegisterInput) => {
    /* confirmPassword is client-only — the gateway DTO doesn't accept it. */
    const { confirmPassword: _confirm, ...payload } = values
    const result = await registerRequest(payload)

    if (!result.ok) {
      toast.error(result.message || t("registerFailed"))
      return
    }

    /* Login is gated on email verification, so we can't start a session here —
       send them to the verify notice with the address prefilled. `next` is
       carried through so it survives to the eventual login. */
    router.replace(
      withNext(
        `/verify-email?email=${encodeURIComponent(values.email)}&sent=1`,
        searchParams.get("next")
      )
    )
  }

  const errText = (key: keyof TRegisterInput) =>
    errors[key] ? tv(errors[key]!.message as string) : undefined

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── Decorative panel (left on register, right on login) ── */}
      <AuthShowcase
        side="left"
        icon={<Rocket className="relative size-9 text-white" />}
        title="Start learning today"
        description="Join 12,000+ Cambodian students — from primary school to university — learning with AI-powered lessons in Khmer."
      >
        <div className="flex w-full flex-col gap-3">
          {BENEFITS.map((item) => (
            <div
              key={item.text}
              className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-2.5 text-left text-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:translate-x-1"
            >
              <item.icon className="size-4 shrink-0 text-white" />
              <span className="text-white/90">{item.text}</span>
            </div>
          ))}
        </div>
      </AuthShowcase>

      {/* ── Form panel ── */}
      <div
        ref={formRef}
        className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-8 py-12"
      >
        {/* Soft ambient background behind the form */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Grid comes from the auth layout's <PaperGrid />, not from here. */}
          <div className="aurora-orb aurora-violet size-80 -top-24 -right-24" />
          <div className="aurora-orb aurora-cyan size-72 -bottom-24 -left-16" style={{ animationDelay: "-14s" }} />
        </div>

        <div data-auth-logo className="relative mb-8">
          <BrandLogo size="lg" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="relative w-full max-w-sm space-y-6">
          <div data-auth-field className="text-center">
            <TypographyH3 className="text-2xl font-bold">{t("registerTitle")}</TypographyH3>
            <TypographyMuted className="mt-1 text-sm">{t("registerSubtitle")}</TypographyMuted>
          </div>

          <div className="space-y-3">
            {/* First + last name */}
            <div data-auth-field className="flex gap-3">
              <Input
                prefix={<UserIcon />}
                placeholder={t("firstNamePlaceholder")}
                type="text"
                autoComplete="given-name"
                validationMessage={errText("firstName")}
                className={boxedField}
                {...register("firstName")}
              />
              <Input
                placeholder={t("lastNamePlaceholder")}
                type="text"
                autoComplete="family-name"
                validationMessage={errText("lastName")}
                className={boxedField}
                {...register("lastName")}
              />
            </div>

            <div data-auth-field>
              <Input
                prefix={<MailIcon />}
                placeholder={t("emailPlaceholder")}
                type="email"
                autoComplete="email"
                validationMessage={errText("email")}
                className={boxedField}
                {...register("email")}
              />
            </div>

            {/* Gender + date of birth */}
            <div data-auth-field className="flex gap-3">
              <div className="flex w-full flex-col items-start gap-1">
                <Controller
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger
                        aria-invalid={Boolean(errors.gender)}
                        className={`h-12 w-full rounded-md border border-input px-3 ${boxedField}`}
                      >
                        <SelectValue placeholder={t("genderPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">{t("male")}</SelectItem>
                        <SelectItem value="Female">{t("female")}</SelectItem>
                        <SelectItem value="Other">{t("other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gender && (
                  <TypographySmall className="text-xs text-red-500">
                    {tv(errors.gender.message as string)}
                  </TypographySmall>
                )}
              </div>

              <Input
                type="date"
                aria-label={t("dateOfBirthLabel")}
                validationMessage={errText("dateOfBirth")}
                className={boxedField}
                {...register("dateOfBirth")}
              />
            </div>

            <div data-auth-field>
              <Input
                prefix={<PhoneIcon />}
                placeholder={t("phonePlaceholder")}
                type="tel"
                autoComplete="tel"
                validationMessage={errText("phone")}
                className={boxedField}
                {...register("phone")}
              />
            </div>

            <div data-auth-field>
              <Input
                prefix={<LockIcon />}
                placeholder={t("passwordPlaceholder")}
                type={passwordVisible ? "text" : "password"}
                autoComplete="new-password"
                validationMessage={errText("password")}
                className={boxedField}
                {...register("password")}
                suffix={
                  passwordVisible ? (
                    <EyeClosedIcon onClick={() => setPasswordVisible(false)} className="cursor-pointer transition-transform hover:scale-110" />
                  ) : (
                    <EyeIcon onClick={() => setPasswordVisible(true)} className="cursor-pointer transition-transform hover:scale-110" />
                  )
                }
              />
            </div>

            <div data-auth-field>
              <Input
                prefix={<LockIcon />}
                placeholder={t("confirmPasswordPlaceholder")}
                type={confirmVisible ? "text" : "password"}
                autoComplete="new-password"
                validationMessage={errText("confirmPassword")}
                className={boxedField}
                {...register("confirmPassword")}
                suffix={
                  confirmVisible ? (
                    <EyeClosedIcon onClick={() => setConfirmVisible(false)} className="cursor-pointer transition-transform hover:scale-110" />
                  ) : (
                    <EyeIcon onClick={() => setConfirmVisible(true)} className="cursor-pointer transition-transform hover:scale-110" />
                  )
                }
              />
            </div>

            <div data-auth-field>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-shine w-full transition-all hover:shadow-[0_0_28px_-6px_rgba(35,131,226,0.6)] hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" />
                    {t("creatingAccount")}
                  </>
                ) : (
                  t("registerButton")
                )}
              </Button>
            </div>
          </div>

          <div data-auth-field>
            <TypographyMuted className="text-center text-sm">
              {t("alreadyHaveAccount")}{" "}
              <Link
                href={withNext("/login", searchParams.get("next"))}
                className="font-semibold text-violet-600 hover:underline dark:text-violet-400"
              >
                {t("signIn")}
              </Link>
            </TypographyMuted>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  )
}
