"use client"

import Link from "next/link"
import { Award, ArrowRight, GraduationCap, Loader2, TriangleAlert } from "lucide-react"
import { useTranslations } from "next-intl"
import { AppShell } from "@/components/utils/app-shell"
import { AnimateIn } from "@/components/utils/animations/animate-in"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TypographyH2 } from "@/components/utils/typography/typography-h2"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { useCertificates } from "@/hooks/utils/use-certificates"
import { useLanguageStore } from "@/stores/languages/language-store"

export default function CertificatesPage() {
  const t = useTranslations("certificates")
  const { language } = useLanguageStore()
  const { certificates, error } = useCertificates()

  const titleOf = (title: string, titleKm?: string | null) =>
    language === "km" && titleKm ? titleKm : title

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-8">
        <AnimateIn animation="fade-up" delay={0.05}>
          <div>
            <TypographyH2 className="mb-1 border-0 pb-0 text-2xl font-bold text-foreground">
              {t("pageTitle")}
            </TypographyH2>
            <TypographyMuted>{t("pageSubtitle")}</TypographyMuted>
          </div>
        </AnimateIn>

        {certificates === null && (
          <div className="flex justify-center py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        )}

        {error && (
          <Card className="flex items-start gap-3 border-amber-200 bg-amber-50 p-5 dark:border-amber-500/25 dark:bg-amber-500/10">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-muted-foreground">{t("loadError")}</p>
          </Card>
        )}

        {certificates?.length === 0 && !error && (
          <AnimateIn animation="fade-up" delay={0.1}>
            <Card className="flex flex-col items-center gap-4 p-10 text-center">
              <div className="rounded-2xl bg-violet-100 p-3 dark:bg-violet-500/15">
                <GraduationCap className="size-7 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {t("emptyTitle")}
                </p>
                <TypographyMuted className="mt-1 text-sm">
                  {t("emptyBody")}
                </TypographyMuted>
              </div>
              <Button asChild>
                <Link href="/courses">{t("emptyAction")}</Link>
              </Button>
            </Card>
          </AnimateIn>
        )}

        {certificates && certificates.length > 0 && (
          <div className="space-y-3">
            {certificates.map((certificate, index) => (
              <AnimateIn
                key={certificate.id}
                animation="fade-up"
                delay={0.06 * index}
              >
                <Card className="flex flex-wrap items-center gap-4 p-5">
                  <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-500/15">
                    <Award className="size-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">
                      {titleOf(certificate.courseTitle, certificate.courseTitleKm)}
                    </p>
                    <p className="mt-0.5 font-mono text-xs tracking-wider text-muted-foreground">
                      {certificate.code}
                    </p>
                  </div>

                  {certificate.revokedAt ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-500/15 dark:text-red-300">
                      {t("revokedBadge")}
                    </span>
                  ) : (
                    <Button asChild variant="outline" className="gap-2">
                      <Link href={`/verify/${certificate.code}`}>
                        {t("viewAction")}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  )}
                </Card>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
