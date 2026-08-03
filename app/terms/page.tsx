import type { Metadata } from "next"
import { TermsPageContent } from "@/components/legal/terms-page"

export const metadata: Metadata = {
  title: "Terms of Service | Apsara Elearning",
  description:
    "Read the terms that apply when you use Apsara Elearning, its courses, AI tutor, and subscription services.",
}

export default function TermsPage() {
  return <TermsPageContent />
}
