"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Loader2, MailIcon } from "lucide-react"
import { AuthCard } from "@/components/auth/auth-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
    <div className="flex h-svh w-full items-center justify-center px-4 pb-4 pt-20 sm:px-6">
      <AuthCard
        title={sentTo ? t("forgotSentTitle") : t("forgotTitle")}
        subtitle={
          sentTo
            ? t("forgotSentBody", { email: sentTo })
            : t("forgotSubtitle")
        }
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
        {sentTo ? (
          <Button asChild className="auth-email-button w-full">
            <Link href={`/reset-password?email=${encodeURIComponent(sentTo)}`}>
              {t("forgotHaveToken")}
            </Link>
          </Button>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" disabled={isSubmitting} className="auth-email-button w-full">
              {isSubmitting ? <Loader2 className="animate-spin" /> : t("forgotButton")}
            </Button>
          </form>
        )}
      </AuthCard>
    </div>
  )
}
