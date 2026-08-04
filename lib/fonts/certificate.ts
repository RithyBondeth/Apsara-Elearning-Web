import { Fraunces, Noto_Serif_Khmer } from "next/font/google"

/**
 * Faces used only by the certificate document.
 *
 * The app runs on Ubuntu + Kantumruy Pro, which are right for product UI and
 * wrong for a keepsake someone prints and hands to an employer — a certificate
 * needs the weight of a serif. Loaded on the certificate routes rather than the
 * root layout so the rest of the app doesn't pay for them.
 *
 * Fraunces over the usual display serif: its optical-size axis holds up at both
 * the learner's name and 9px caption text, and it has enough character to not
 * read as a word-processor template.
 */
export const certificateDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-certificate",
  display: "swap",
})

/** Khmer serif, so both scripts on the document share one voice. */
export const certificateKhmer = Noto_Serif_Khmer({
  subsets: ["khmer"],
  weight: ["400", "600"],
  variable: "--font-certificate-khmer",
  display: "swap",
})

/** Applied to any subtree that renders a certificate. */
export const certificateFontClass = `${certificateDisplay.variable} ${certificateKhmer.variable}`
