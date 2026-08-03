"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  ArrowLeft, EyeClosedIcon, EyeIcon, KeyRound, Loader2, LockIcon,
} from "lucide-react"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resetPasswordRequest } from "@/lib/auth/client"
import { resetPasswordSchema, type TResetPasswordInput } from "@/lib/validation/auth"

function ResetPasswordInner() {
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")
  const params = useSearchParams()

  /* The email delivers a raw token (see email.service.ts), so a `?token=`
     link prefills it but the field stays editable for the paste-in case. */
  const [token, setToken] = useState(params.get("token") ?? "")
  const [visible, setVisible] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) })

  const onSubmit = async ({ newPassword }: TResetPasswordInput) => {
    if (!token.trim()) {
      toast.error(t("resetTokenRequired"))
      return
    }
    const result = await resetPasswordRequest(token.trim(), newPassword)
    if (result.ok) {
      setDone(true)
      return
    }
    toast.error(result.message || t("resetFailed"))
  }

  if (done) {
    return (
      <div className="flex h-svh w-full items-center justify-center px-4 pb-4 pt-20 sm:px-6">
        <AuthCard
          title={t("resetSuccessTitle")}
          subtitle={t("resetSuccessBody")}
        >
          <Button asChild className="auth-email-button w-full">
            <Link href="/login">{t("goToLogin")}</Link>
          </Button>
        </AuthCard>
      </div>
    )
  }

  return (
    <div className="flex h-svh w-full items-center justify-center px-4 pb-4 pt-20 sm:px-6">
      <AuthCard
        title={t("resetTitle")}
        subtitle={t("resetSubtitle")}
        footer={
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            <ArrowLeft className="size-3.5" />
            {t("backToLogin")}
          </Link>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label={t("resetTokenLabel")}
            prefix={<KeyRound className="size-4" />}
            placeholder={t("resetTokenPlaceholder")}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="auth-input"
          />

          <Input
            label={t("passwordLabel")}
            prefix={<LockIcon />}
            placeholder={t("resetNewPasswordPlaceholder")}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            validationMessage={errors.newPassword?.message ? tv(errors.newPassword.message) : undefined}
            className="auth-input"
            {...register("newPassword")}
            suffix={
              visible ? (
                <button
                  type="button"
                  aria-label={t("hidePassword")}
                  onClick={() => setVisible(false)}
                  className="rounded-md p-0.5 hover:text-foreground"
                >
                  <EyeClosedIcon className="size-4" />
                </button>
              ) : (
                <button
                  type="button"
                  aria-label={t("showPassword")}
                  onClick={() => setVisible(true)}
                  className="rounded-md p-0.5 hover:text-foreground"
                >
                  <EyeIcon className="size-4" />
                </button>
              )
            }
          />

          <Input
            label={t("confirmPasswordLabel")}
            prefix={<LockIcon />}
            placeholder={t("confirmPasswordPlaceholder")}
            type={visible ? "text" : "password"}
            autoComplete="new-password"
            validationMessage={errors.confirmPassword?.message ? tv(errors.confirmPassword.message) : undefined}
            className="auth-input"
            {...register("confirmPassword")}
          />

          <Button type="submit" disabled={isSubmitting} className="auth-email-button w-full">
            {isSubmitting ? <Loader2 className="animate-spin" /> : t("resetButton")}
          </Button>
        </form>
      </AuthCard>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  )
}
