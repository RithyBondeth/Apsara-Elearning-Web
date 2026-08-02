"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, MailCheck, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BrandLogo } from "@/components/utils/brand-logo"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { forgotPasswordRequest } from "@/lib/auth/client"
import { forgotPasswordSchema, type TForgotPasswordInput } from "@/lib/validation/auth"

export default function ForgotPasswordPage() {
  const t = useTranslations("auth")
  const tv = useTranslations("auth.validation")

  /* The API answers generically to prevent account enumeration, so a success
     screen is shown for any valid email — never "no such account". */
  const [sentTo, setSentTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) })

  const onSubmit = async ({ email }: TForgotPasswordInput) => {
    await forgotPasswordRequest(email)
    setSentTo(email)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-8 py-12">
      <div className="mb-8">
        <BrandLogo size="lg" />
      </div>

      {sentTo ? (
        <div className="w-full max-w-sm space-y-6 text-center">
          <MailCheck className="mx-auto size-12 text-violet-500" />
          <TypographyH3 className="text-xl font-bold">{t("forgotSentTitle")}</TypographyH3>
          <TypographyMuted className="text-sm">
            {t("forgotSentBody", { email: sentTo })}
          </TypographyMuted>
          <Button asChild className="btn-shine w-full">
            <Link href={`/reset-password?email=${encodeURIComponent(sentTo)}`}>
              {t("forgotHaveToken")}
            </Link>
          </Button>
          <TypographyMuted className="text-sm">
            <Link href="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
              {t("backToLogin")}
            </Link>
          </TypographyMuted>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div className="text-center">
            <TypographyH3 className="text-2xl font-bold">{t("forgotTitle")}</TypographyH3>
            <TypographyMuted className="mt-1 text-sm">{t("forgotSubtitle")}</TypographyMuted>
          </div>

          <Input
            prefix={<MailIcon />}
            placeholder={t("emailPlaceholder")}
            type="email"
            autoComplete="email"
            validationMessage={errors.email?.message ? tv(errors.email.message) : undefined}
            className="bg-background/70"
            {...register("email")}
          />

          <Button type="submit" disabled={isSubmitting} className="btn-shine w-full">
            {isSubmitting ? <Loader2 className="animate-spin" /> : t("forgotButton")}
          </Button>

          <TypographyMuted className="text-center text-sm">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-semibold text-violet-600 hover:underline dark:text-violet-400"
            >
              <ArrowLeft className="size-3.5" />
              {t("backToLogin")}
            </Link>
          </TypographyMuted>
        </form>
      )}
    </div>
  )
}
