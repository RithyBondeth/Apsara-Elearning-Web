import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef, forwardRef } from "react";

export const TypographyH4 = forwardRef<
  HTMLHeadingElement,
  ComponentPropsWithoutRef<"h4">
>(({ className, children, ...props }, ref) => {
  return (
    <h4
      ref={ref}
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight leading-khmer",
        className,
      )}
      {...props}
    >
      {children}
    </h4>
  );
});

TypographyH4.displayName = "TypographyH4";
