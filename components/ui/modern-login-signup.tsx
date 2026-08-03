"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { AuthCard } from "@/components/auth/auth-card"

type AuthMode = "login" | "signup"

interface ModernLoginSignupProps {
  mode: AuthMode
  switchHref: string
  children: ReactNode
  className?: string
}

export default function ModernLoginSignup({
  mode,
  switchHref,
  children,
  className,
}: ModernLoginSignupProps) {
  const t = useTranslations("auth")
  const isLogin = mode === "login"

  return (
    <AuthCard
      title={isLogin ? t("loginTitle") : t("registerTitle")}
      subtitle={isLogin ? t("loginSubtitle") : t("registerSubtitle")}
      size={isLogin ? "default" : "wide"}
      className={className}
      footer={
        <>
          {isLogin ? t("noAccount") : t("alreadyHaveAccount")} {" "}
          <Link
            href={switchHref}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
          >
            {isLogin ? t("signUp") : t("signIn")}
          </Link>
        </>
      }
    >
      {children}
    </AuthCard>
  )
}
