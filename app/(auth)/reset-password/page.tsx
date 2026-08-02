"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  CheckCircle2, EyeClosedIcon, EyeIcon, KeyRound, Loader2, LockIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BrandLogo } from "@/components/utils/brand-logo"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
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
      <div className="w-full max-w-sm space-y-6 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
        <TypographyH3 className="text-xl font-bold">{t("resetSuccessTitle")}</TypographyH3>
        <TypographyMuted className="text-sm">{t("resetSuccessBody")}</TypographyMuted>
        <Button asChild className="btn-shine w-full">
          <Link href="/login">{t("goToLogin")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-5">
      <div className="text-center">
        <TypographyH3 className="text-2xl font-bold">{t("resetTitle")}</TypographyH3>
        <TypographyMuted className="mt-1 text-sm">{t("resetSubtitle")}</TypographyMuted>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {t("resetTokenLabel")}
        </label>
        <Input
          prefix={<KeyRound className="size-4" />}
          placeholder={t("resetTokenPlaceholder")}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="bg-background/70"
        />
      </div>

      <Input
        prefix={<LockIcon />}
        placeholder={t("resetNewPasswordPlaceholder")}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        validationMessage={errors.newPassword?.message ? tv(errors.newPassword.message) : undefined}
        className="bg-background/70"
        {...register("newPassword")}
        suffix={
          visible ? (
            <EyeClosedIcon onClick={() => setVisible(false)} className="cursor-pointer" />
          ) : (
            <EyeIcon onClick={() => setVisible(true)} className="cursor-pointer" />
          )
        }
      />

      <Input
        prefix={<LockIcon />}
        placeholder={t("confirmPasswordPlaceholder")}
        type={visible ? "text" : "password"}
        autoComplete="new-password"
        validationMessage={errors.confirmPassword?.message ? tv(errors.confirmPassword.message) : undefined}
        className="bg-background/70"
        {...register("confirmPassword")}
      />

      <Button type="submit" disabled={isSubmitting} className="btn-shine w-full">
        {isSubmitting ? <Loader2 className="animate-spin" /> : t("resetButton")}
      </Button>

      <TypographyMuted className="text-center text-sm">
        <Link href="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
          {t("backToLogin")}
        </Link>
      </TypographyMuted>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-8 py-12">
      <div className="mb-8">
        <BrandLogo size="lg" />
      </div>
      <Suspense fallback={null}>
        <ResetPasswordInner />
      </Suspense>
    </div>
  )
}
