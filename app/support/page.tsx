import type { Metadata } from "next"
import { SupportPageContent } from "@/components/public/support-page"

export const metadata: Metadata = {
  title: "Help Center | Apsara Elearning",
  description:
    "Find answers and troubleshooting help for Apsara Elearning accounts, courses, AI tutoring, subscriptions, and privacy.",
}

export default function SupportPage() {
  return <SupportPageContent />
}
