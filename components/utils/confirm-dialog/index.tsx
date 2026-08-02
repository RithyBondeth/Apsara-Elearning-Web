"use client"

import * as React from "react"
import { useTranslations } from "next-intl"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  /** The control that opens the dialog — rendered as-is, so it keeps its own styling. */
  children: React.ReactNode
  title: string
  description: string
  /** Defaults to the shared "Confirm" label. */
  confirmLabel?: string
  /** Danger paints the confirm button red; use it for anything destructive. */
  variant?: "default" | "danger"
  onConfirm: () => void
  /** Optional icon shown beside the title. */
  icon?: React.ReactNode
}

/**
 * Asks the student to confirm before an action that is hard to undo.
 *
 * @example
 * <ConfirmDialog title={t("signOutTitle")} description={t("signOutDesc")}
 *                variant="danger" onConfirm={signOut}>
 *   <button>Sign out</button>
 * </ConfirmDialog>
 */
export function ConfirmDialog({
  children,
  title,
  description,
  confirmLabel,
  variant = "default",
  onConfirm,
  icon,
}: ConfirmDialogProps) {
  const t = useTranslations("common")

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <div className="flex items-start gap-3.5">
          {icon && (
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0",
                variant === "danger"
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-1.5">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6">
          <AlertDialogCancel asChild>
            <button
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-border
                         text-muted-foreground hover:text-foreground hover:bg-muted transition-all
                         outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {t("cancel")}
            </button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <button
              onClick={onConfirm}
              className={cn(
                `px-4 py-2.5 rounded-xl text-sm font-semibold transition-all outline-none
                 focus-visible:ring-2`,
                variant === "danger"
                  ? "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/40"
                  : "gradient-bg-primary text-white hover:opacity-90 focus-visible:ring-primary/40"
              )}
            >
              {confirmLabel ?? t("confirm")}
            </button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
