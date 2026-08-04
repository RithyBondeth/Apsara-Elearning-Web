"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ShieldCheck } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LandingNavbar } from "@/components/landing/landing-navbar"
import { LandingFooter } from "@/components/landing/landing-footer"

/**
 * Code entry for someone holding a printed certificate.
 *
 * The code is normalised server-side, so any case and either spelling (with or
 * without dashes) resolves — no need to make the visitor match the format.
 */
export default function VerifyLandingPage() {
  const t = useTranslations("certificates")
  const router = useRouter()
  const [code, setCode] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = code.trim()
    if (trimmed) router.push(`/verify/${encodeURIComponent(trimmed)}`)
  }

  return (
    <>
      <LandingNavbar
        menuOpen={menuOpen}
        onMenuToggle={() => setMenuOpen((open) => !open)}
      />
      <main className="mx-auto w-full max-w-xl px-4 pb-24 pt-32 sm:px-6">
        <div className="text-center">
          <ShieldCheck className="mx-auto size-10 text-violet-600 dark:text-violet-400" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            {t("verifyPageTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("verifyPageSubtitle")}
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="APS-XXXX-XXXX-XXXX"
            aria-label={t("codeLabel")}
            autoComplete="off"
            spellCheck={false}
            className="h-auto flex-1 rounded-xl px-4 py-3 font-mono tracking-wider"
          />
          <Button type="submit" disabled={!code.trim()} className="py-3">
            {t("verifyAction")}
          </Button>
        </form>
      </main>
      <LandingFooter />
    </>
  )
}
