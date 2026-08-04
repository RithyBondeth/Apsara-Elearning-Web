"use client"

import { useState } from "react"
import { Check, Link2, Printer } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

/**
 * Print and share controls for a certificate.
 *
 * `no-print` keeps them off the printed page. Printing is the download: the
 * document is bilingual and browsers shape Khmer correctly, which server-side
 * PDF toolkits generally do not.
 */
export function CertificateActions({ shareUrl }: { shareUrl: string }) {
  const t = useTranslations("certificates")
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* Clipboard blocked (insecure origin, denied permission) — the URL is
         in the address bar anyway, so there is nothing useful to say here. */
    }
  }

  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-3">
      <Button onClick={() => window.print()} className="gap-2">
        <Printer className="size-4" />
        {t("print")}
      </Button>
      <Button variant="outline" onClick={() => void copyLink()} className="gap-2">
        {copied ? (
          <Check className="size-4 text-emerald-600" />
        ) : (
          <Link2 className="size-4" />
        )}
        {copied ? t("linkCopied") : t("copyLink")}
      </Button>
    </div>
  )
}
