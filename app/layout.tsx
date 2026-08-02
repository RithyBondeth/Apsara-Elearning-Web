import { JetBrains_Mono, Roboto_Slab, Kantumruy_Pro } from "next/font/google"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import "./globals.css"
import { ThemeProvider } from "@/components/utils/themes/theme-provider"
import { LanguageProviderClient } from "@/components/utils/languages/language-provider-client"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["300", "400"],
  variable: "--font-khmer",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

const geistMonoHeading = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Apsara Elearning — Learn Every Subject in Khmer",
  description:
    "The AI-powered learning platform for Cambodian students — every subject from Grade 1 to university, with a personal AI tutor that speaks Khmer.",
  keywords: [
    "e-learning",
    "Cambodia",
    "Khmer",
    "AI",
    "K-12",
    "university",
    "learn",
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const initialLang =
    (cookieStore.get("apsara-elearning-lang")?.value as "en" | "km") || "en"

  return (
    <html
      lang={initialLang}
      suppressHydrationWarning
      className={cn(
        "antialiased",
        robotoSlab.variable,
        kantumruyPro.variable,
        jetbrainsMono.variable,
        geistMonoHeading.variable,
        "font-sans"
      )}
    >
      <body>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider>
            <LanguageProviderClient initialLang={initialLang}>
              {children}
            </LanguageProviderClient>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
