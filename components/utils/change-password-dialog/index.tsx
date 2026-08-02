"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { KeyRound, Loader2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ApiError } from "@/lib/api/client"
import { changePassword } from "@/lib/api/auth"
import { changePasswordSchema, type TChangePasswordInput } from "@/lib/validation/auth"

/**
 * Change-password form in a modal. Unlike the anonymous reset flow, this hits
 * the authenticated `/auth/change-password` endpoint through the proxy, which
 * verifies `currentPassword` (401 if wrong).
 */
export function ChangePasswordDialog({ children }: { children: React.ReactNode }) {
  const t = useTranslations("profile")
  const tv = useTranslations("auth.validation")
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) })

  const onSubmit = async (values: TChangePasswordInput) => {
    try {
      await changePassword(values.currentPassword, values.newPassword)
      toast.success(t("passwordChanged"))
      reset()
      setOpen(false)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("currentPassword", { message: "currentPasswordWrong" })
        return
      }
      toast.error(t("saveError"))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            {t("changePassword")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t("currentPassword")}
            </label>
            <Input
              type="password"
              autoComplete="current-password"
              validationMessage={errors.currentPassword?.message ? tv(errors.currentPassword.message) : undefined}
              {...register("currentPassword")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t("newPassword")}
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              validationMessage={errors.newPassword?.message ? tv(errors.newPassword.message) : undefined}
              {...register("newPassword")}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              {t("confirmNewPassword")}
            </label>
            <Input
              type="password"
              autoComplete="new-password"
              validationMessage={errors.confirmPassword?.message ? tv(errors.confirmPassword.message) : undefined}
              {...register("confirmPassword")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="btn-shine">
              {isSubmitting ? <Loader2 className="animate-spin" /> : t("changePassword")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
