import type { Metadata } from "next"
import { PrivacyPageContent } from "@/components/legal/privacy-page"

export const metadata: Metadata = {
  title: "Privacy Policy | Apsara Elearning",
  description:
    "Learn what personal information Apsara Elearning collects, why we use it, and the choices available to you.",
}

export default function PrivacyPage() {
  return <PrivacyPageContent />
}
