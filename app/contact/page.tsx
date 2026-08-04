import type { Metadata } from "next"
import { ContactPageContent } from "@/components/public/contact-page"

export const metadata: Metadata = {
  title: "Contact Us | Apsara Elearning",
  description:
    "Contact Apsara Elearning for help with your account, courses, AI tutor, billing, or privacy questions.",
}

export default function ContactPage() {
  return <ContactPageContent />
}
