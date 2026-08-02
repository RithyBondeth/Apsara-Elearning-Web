import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef, forwardRef } from "react"

export const TypographyH2 = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<"h2">
>(({ className, children, ...props }, ref) => {
  return (
    <h2
      ref={ref}
      className={cn(
        "scroll-m-20 pb-2 text-2xl font-semibold tracking-tight first:mt-0 sm:text-3xl leading-khmer",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
})

TypographyH2.displayName = "TypographyH2"
