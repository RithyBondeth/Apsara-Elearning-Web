import { cn } from "@/lib/utils"
import * as React from "react"
import type { FieldError, FieldErrorsImpl, Merge } from "react-hook-form"
import { TypographySmall } from "@/components/utils/typography/typography-small"

type TRHFMessage =
  | string
  | FieldError
  | Merge<FieldError, FieldErrorsImpl<Record<string, unknown>>>

export interface IInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "prefix" | "suffix"
> {
  label?: React.ReactNode
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  validationMessage?: TRHFMessage
}

const Input = React.forwardRef<HTMLInputElement, IInputProps>(
  ({ className, type, label, prefix, suffix, validationMessage, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = props.id ?? generatedId
    const message =
      typeof validationMessage === "string"
        ? validationMessage
        : validationMessage?.message

    return (
      <div className="flex w-full flex-col items-start gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="auth-field-label text-xs font-semibold text-foreground/80"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-12 w-full items-center rounded-md border border-input bg-background px-3 text-base ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
        >
          {prefix && (
            <span className="mr-2 text-muted-foreground">{prefix}</span>
          )}
          <input
            type={type}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-sm",
              props.disabled ? "text-muted-foreground" : "text-foreground"
            )}
            ref={ref}
            {...props}
            id={inputId}
            aria-invalid={props["aria-invalid"] ?? Boolean(message)}
          />
          {suffix && (
            <span className="ml-2 text-muted-foreground">{suffix}</span>
          )}
        </div>

        {Boolean(message) && (
          <TypographySmall className="text-xs text-red-500">
            {typeof message === "string" ? message : String(message)}
          </TypographySmall>
        )}
      </div>
    )
  }
)

Input.displayName = "Input"
export { Input }
