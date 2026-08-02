import { cn } from "@/lib/utils"
import { ComponentPropsWithoutRef, forwardRef } from "react"

export const TypographyH1 = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<"h1">
>(({ className, children, ...props }, ref) => {
  return (
    <h1
      ref={ref}
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl leading-khmer",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  )
})

TypographyH1.displayName = "TypographyH1"
