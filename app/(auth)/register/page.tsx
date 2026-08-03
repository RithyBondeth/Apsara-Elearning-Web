"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import gsap from "gsap"
import {
  ArrowLeft, ArrowRight, EyeIcon, EyeClosedIcon, LockIcon, MailIcon,
  UserIcon, PhoneIcon, Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import ModernLoginSignup from "@/components/ui/modern-login-signup"
import { TypographySmall } from "@/components/utils/typography/typography-small"
import { registerRequest } from "@/lib/auth/client"
import { withNext } from "@/lib/auth/next-param"
import { registerSchema, type TRegisterInput } from "@/lib/validation/auth"

const boxedField = "auth-input"

function RegisterInner() {
  const [step, setStep] = useState<1 | 2>(1)
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
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TRegisterInput>({ resolver: zodResolver(registerSchema) })

  /* Entrance timeline — logo pops, then the form cascades up */
  useEffect(() => {
    const root = formRef.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const ctx = gsap.context(() => {
      gsap.from("[data-auth-field]", {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.06,
        ease: "power3.out",
      })
    }, root)
    return () => ctx.revert()
  }, [])

  const onSubmit = async (values: TRegisterInput) => {
    /* confirmPassword is client-only — the gateway DTO doesn't accept it. */
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      gender: values.gender,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
    }
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

  const password = watch("password", "")
  const passwordStrength = [
    password.length >= 8,
    password.length >= 12,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d|[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const continueRegistration = async () => {
    const valid = await trigger(
      ["firstName", "lastName", "email", "phone"],
      { shouldFocus: true }
    )
    if (valid) setStep(2)
  }

  return (
    <div ref={formRef} className="flex h-svh w-full items-center justify-center px-4 pb-4 pt-20 sm:px-6">
      <ModernLoginSignup
        mode="signup"
        switchHref={withNext("/login", searchParams.get("next"))}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-muted-foreground">
              {t("stepProgress", { current: step, total: 2 })}
            </span>
            <div className="flex flex-1 justify-end gap-1.5" aria-hidden>
              <span className="h-1.5 w-12 rounded-full bg-blue-500" />
              <span className={`h-1.5 w-12 rounded-full transition-colors ${step === 2 ? "bg-blue-500" : "bg-muted"}`} />
            </div>
          </div>

          {step === 1 ? (
            <div key="profile" className="animate-scale-in space-y-3">
              <div data-auth-field className="grid grid-cols-2 gap-2.5">
                <Input
                  label={t("firstNameLabel")}
                  prefix={<UserIcon />}
                  placeholder={t("firstNamePlaceholder")}
                  type="text"
                  autoComplete="given-name"
                  validationMessage={errText("firstName")}
                  className={boxedField}
                  {...register("firstName")}
                />
                <Input
                  label={t("lastNameLabel")}
                  placeholder={t("lastNamePlaceholder")}
                  type="text"
                  autoComplete="family-name"
                  validationMessage={errText("lastName")}
                  className={boxedField}
                  {...register("lastName")}
                />
              </div>

              <Input
                label={t("emailLabel")}
                prefix={<MailIcon />}
                placeholder={t("emailPlaceholder")}
                type="email"
                autoComplete="email"
                validationMessage={errText("email")}
                className={boxedField}
                {...register("email")}
              />

              <Input
                label={t("phoneLabel")}
                prefix={<PhoneIcon />}
                placeholder={t("phonePlaceholder")}
                type="tel"
                autoComplete="tel"
                validationMessage={errText("phone")}
                className={boxedField}
                {...register("phone")}
              />

              <Button
                type="button"
                onClick={continueRegistration}
                className="auth-email-button w-full transition-transform hover:-translate-y-0.5"
              >
                {t("continue")}
                <ArrowRight />
              </Button>
            </div>
          ) : (
            <div key="security" className="animate-scale-in space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex w-full flex-col items-start gap-1">
                  <span className="auth-field-label text-xs font-semibold text-foreground/80">
                    {t("genderLabel")}
                  </span>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          aria-invalid={Boolean(errors.gender)}
                          className={`w-full border px-3 ${boxedField}`}
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
                  label={t("dateOfBirthLabel")}
                  type="date"
                  aria-label={t("dateOfBirthLabel")}
                  validationMessage={errText("dateOfBirth")}
                  className={boxedField}
                  {...register("dateOfBirth")}
                />
              </div>

              <div>
                <Input
                  label={t("passwordLabel")}
                  prefix={<LockIcon />}
                  placeholder={t("passwordPlaceholder")}
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  validationMessage={errText("password")}
                  className={boxedField}
                  {...register("password")}
                  suffix={passwordVisible ? (
                    <button
                      type="button"
                      aria-label={t("hidePassword")}
                      onClick={() => setPasswordVisible(false)}
                      className="rounded-md p-0.5 hover:text-foreground"
                    >
                      <EyeClosedIcon className="size-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={t("showPassword")}
                      onClick={() => setPasswordVisible(true)}
                      className="rounded-md p-0.5 hover:text-foreground"
                    >
                      <EyeIcon className="size-4" />
                    </button>
                  )}
                />
                <div className="mt-1.5 flex gap-1" aria-label={t("passwordStrength")}>
                  {[1, 2, 3, 4].map((level) => (
                    <span
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength >= level
                          ? level < 3
                            ? "bg-amber-400"
                            : "bg-emerald-500"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <Input
                label={t("confirmPasswordLabel")}
                prefix={<LockIcon />}
                placeholder={t("confirmPasswordPlaceholder")}
                type={confirmVisible ? "text" : "password"}
                autoComplete="new-password"
                validationMessage={errText("confirmPassword")}
                className={boxedField}
                {...register("confirmPassword")}
                suffix={confirmVisible ? (
                  <button
                    type="button"
                    aria-label={t("hidePassword")}
                    onClick={() => setConfirmVisible(false)}
                    className="rounded-md p-0.5 hover:text-foreground"
                  >
                    <EyeClosedIcon className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    aria-label={t("showPassword")}
                    onClick={() => setConfirmVisible(true)}
                    className="rounded-md p-0.5 hover:text-foreground"
                  >
                    <EyeIcon className="size-4" />
                  </button>
                )}
              />

              <div className="grid grid-cols-[auto_1fr] gap-2.5">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-[2.75rem] px-4">
                  <ArrowLeft />
                  <span className="hidden sm:inline">{t("back")}</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="auth-email-button w-full transition-transform hover:-translate-y-0.5"
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
          )}
        </form>
      </ModernLoginSignup>
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
