import Image from "next/image"
import Link from "next/link"
import { Ubuntu } from "next/font/google"
import { cn } from "@/lib/utils"

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

interface BrandLogoProps {
  className?: string
  /** Logo mark + wordmark size (default: "md") */
  size?: "sm" | "md" | "lg"
}

/** The approved Apsara crown and open-book brand mark. */
export function MokotMark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/mark.png"
      alt=""
      width={2048}
      height={2048}
      className={cn("object-contain", className)}
      aria-hidden="true"
    />
  )
}

/**
 * Apsara Elearning logo — the approved crown/book mark with an Ubuntu wordmark.
 * Links back to the landing page.
 */
export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const mark = size === "lg" ? "size-11" : size === "sm" ? "size-8" : "size-9"
  const word =
    size === "lg" ? "text-xl" : size === "sm" ? "text-base" : "text-lg"

  return (
    <Link
      href="/"
      aria-label="Apsara Elearning home"
      className={cn("group flex shrink-0 items-center gap-2", className)}
    >
      <MokotMark
        className={cn(
          "shrink-0 transition-transform duration-300 group-hover:scale-110",
          mark
        )}
      />
      <span
        className={cn(ubuntu.className, "leading-none whitespace-nowrap", word)}
      >
        <span className="font-bold text-[#1248bc]">Apsara</span>
        <span className="font-normal text-[#37352d] dark:text-[#f5f7fa]">
          {" "}
          Elearning
        </span>
      </span>
    </Link>
  )
}
