"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Download, Loader2, ShieldAlert, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TypographyH3 } from "@/components/utils/typography/typography-h3"
import { TypographyMuted } from "@/components/utils/typography/typography-muted"
import { useSignOut } from "@/hooks/utils/use-sign-out"
import { ApiError } from "@/lib/api/client"
import { exportMyData, requestAccountDeletion } from "@/lib/api/account"

/** Mirrors ACCOUNT_DELETION_GRACE_DAYS in the API. */
const GRACE_DAYS = 7

/** Hands the browser a JSON file without a round trip through a URL. */
function saveJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/** "Your data" on the profile page: export everything, or delete the account. */
export function AccountDataCard() {
  const t = useTranslations("profile")
  const [exporting, setExporting] = useState(false)

  const download = async () => {
    setExporting(true)
    try {
      const data = await exportMyData()
      const day = new Date().toISOString().slice(0, 10)
      saveJson(data, `apsara-elearning-data-${day}.json`)
    } catch {
      toast.error(t("downloadError"))
    } finally {
      setExporting(false)
    }
  }

  return (
    <Card className="rounded-2xl p-5">
      <div className="mb-1 flex items-center gap-2.5">
        <ShieldAlert className="size-4 text-muted-foreground" />
        <TypographyH3 className="text-base font-semibold text-foreground">
          {t("dataTitle")}
        </TypographyH3>
      </div>
      <TypographyMuted className="mb-4 text-xs">
        {t("dataDesc")}
      </TypographyMuted>

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" onClick={download} disabled={exporting}>
          {exporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {t("downloadData")}
        </Button>
        <DeleteAccountDialog />
      </div>
    </Card>
  )
}

function DeleteAccountDialog() {
  const t = useTranslations("profile")
  const signOut = useSignOut()
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [wrongPassword, setWrongPassword] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!password) return
    setBusy(true)
    setWrongPassword(false)
    try {
      const { deleteAfter } = await requestAccountDeletion(password)
      // The server already revoked every session; clear this one locally and
      // tell the login page when the deletion takes effect.
      await signOut(`/login?deletion=${encodeURIComponent(deleteAfter)}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setWrongPassword(true)
      } else {
        toast.error(t("deleteError"))
      }
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setPassword("")
          setWrongPassword(false)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/25 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          <Trash2 className="size-4" />
          {t("deleteAccount")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="size-4" />
            {t("deleteTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("deleteDesc", { days: GRACE_DAYS })}
          </DialogDescription>
        </DialogHeader>

        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>{t("deletePointCancel", { days: GRACE_DAYS })}</li>
          <li>{t("deletePointSignOut")}</li>
          <li>{t("deletePointSubscription")}</li>
          <li>{t("deletePointPayments")}</li>
          <li>{t("deletePointExport")}</li>
        </ul>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="delete-account-password"
              className="mb-1.5 block text-xs font-medium text-muted-foreground"
            >
              {t("deletePasswordLabel")}
            </label>
            <Input
              id="delete-account-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              validationMessage={
                wrongPassword ? t("deletePasswordWrong") : undefined
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              variant="destructive"
              disabled={!password || busy}
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              {t("deleteConfirm")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
