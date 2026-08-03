import type { Metadata } from "next"
import { CookiesPageContent } from "@/components/legal/cookies-page"

export const metadata: Metadata = {
  title: "Cookie Policy | Apsara Elearning",
  description:
    "Learn how Apsara Elearning uses cookies and browser storage to keep accounts secure and remember your preferences.",
}

export default function CookiesPage() {
  return <CookiesPageContent />
}
