import { toKhmerNumerals } from "@/utils/functions/format"

/* ── Khmer month names, for the issue date ────────────────────────────── */

const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
] as const

/** `04 August 2026` alongside `០៤ សីហា ២០២៦`. */
function issuedOn(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return { latin: "—", khmer: "—" }
  return {
    latin: date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    khmer: `${toKhmerNumerals(date.getDate())} ${KHMER_MONTHS[date.getMonth()]} ${toKhmerNumerals(date.getFullYear())}`,
  }
}

export interface ICertificateSheetProps {
  learnerName: string
  courseTitle: string
  courseTitleKm?: string | null
  code: string
  issuedAt: string
  /** Shown as a struck-through overlay; a revoked certificate must not read as valid. */
  revoked?: boolean
  verifyUrl: string
}

/**
 * The certificate document.
 *
 * Deliberately not styled like the rest of the app: this is the one surface a
 * learner prints and hands to someone, so it borrows from Khmer palm-leaf
 * manuscripts — landscape, ruled margins, content inset — rather than from
 * product UI. Colours are literal (`#…`) rather than theme tokens because the
 * sheet must look identical in dark mode and on paper.
 *
 * Presentational and server-renderable, so the public verify page needs no JS.
 */
export function CertificateSheet({
  learnerName,
  courseTitle,
  courseTitleKm,
  code,
  issuedAt,
  revoked = false,
  verifyUrl,
}: ICertificateSheetProps) {
  const issued = issuedOn(issuedAt)

  return (
    <article
      className="certificate-sheet relative mx-auto w-full max-w-4xl overflow-hidden"
      style={{
        aspectRatio: "297 / 210",
        backgroundColor: "#EAE4D9",
        color: "#1C201E",
        fontFamily: "var(--font-certificate), Georgia, serif",
        // Sizes below are in cqw, so the document scales as one piece rather
        // than reflowing — a certificate has to keep its proportions on a phone.
        containerType: "inline-size",
      }}
      aria-label={`Certificate of completion for ${courseTitle}, issued to ${learnerName}`}
    >
      {/* Ruled margins — the manuscript device this layout is built on. */}
      <div
        className="pointer-events-none absolute inset-[3.5%] border-y-2"
        style={{ borderColor: "#2E6A5E" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-[4.6%] border-y"
        style={{ borderColor: "#C4B9A6" }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col justify-between px-[8cqw] py-[6cqw]">
        {/* Masthead */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[clamp(0.42rem,1.5cqw,0.8rem)] font-semibold uppercase"
              style={{ letterSpacing: "0.32em", color: "#2E6A5E" }}
            >
              Apsara Elearning
            </p>
            <p
              className="mt-1 text-[clamp(0.45rem,1.6cqw,0.85rem)]"
              style={{ color: "#6B665C" }}
            >
              Certificate of Completion
            </p>
          </div>
          <p
            className="text-right text-[clamp(0.6rem,2.5cqw,1.15rem)]"
            style={{
              fontFamily: "var(--font-certificate-khmer), serif",
              color: "#1C201E",
            }}
          >
            វិញ្ញាបនបត្របញ្ចប់ការសិក្សា
          </p>
        </header>

        {/* Award — centred in the space between masthead and footer, so the
            slack distributes evenly instead of pooling into one void. */}
        <div className="flex min-w-0 flex-1 flex-col justify-center py-[2cqw]">
          <p
            className="text-[clamp(0.32rem,1.45cqw,0.78rem)] uppercase"
            style={{ letterSpacing: "0.28em", color: "#6B665C" }}
          >
            Awarded to
          </p>
          <h1
            className="mt-[1cqw] truncate text-[clamp(1rem,7.4cqw,3.4rem)] font-semibold leading-[1.05]"
            style={{ letterSpacing: "-0.015em" }}
          >
            {learnerName}
          </h1>

          <p
            className="mt-[3cqw] text-[clamp(0.33rem,1.5cqw,0.82rem)]"
            style={{ color: "#6B665C" }}
          >
            for completing
          </p>
          <p className="mt-1 text-[clamp(0.62rem,3.5cqw,1.6rem)] font-semibold leading-snug">
            {courseTitle}
          </p>
          {courseTitleKm && (
            <p
              className="mt-1 text-[clamp(0.55rem,2.9cqw,1.3rem)] leading-snug"
              style={{
                fontFamily: "var(--font-certificate-khmer), serif",
                color: "#3C443F",
              }}
            >
              {courseTitleKm}
            </p>
          )}
        </div>

        {/* Verification cartouche — the reason this document can be trusted,
            so it carries real weight rather than hiding in the small print. */}
        <footer className="flex flex-wrap items-end justify-between gap-x-[4cqw] gap-y-[2cqw]">
          <div className="min-w-0">
            <p
              className="text-[clamp(0.3rem,1.3cqw,0.7rem)] uppercase"
              style={{ letterSpacing: "0.28em", color: "#6B665C" }}
            >
              Verification code
            </p>
            <p
              className="mt-[1.2cqw] inline-block border px-[1.6cqw] py-[0.8cqw] text-[clamp(0.4rem,2.5cqw,1.1rem)] font-semibold"
              style={{
                fontFamily: "var(--font-mono), ui-monospace, monospace",
                borderColor: "#2E6A5E",
                color: "#2E6A5E",
                letterSpacing: "0.1em",
              }}
            >
              {code}
            </p>
            <p
              className="mt-[0.8cqw] truncate text-[clamp(0.28rem,1.25cqw,0.68rem)]"
              style={{ color: "#6B665C" }}
            >
              Verify at {verifyUrl}
            </p>
          </div>

          <div className="text-right">
            <p
              className="text-[clamp(0.3rem,1.3cqw,0.7rem)] uppercase"
              style={{ letterSpacing: "0.28em", color: "#6B665C" }}
            >
              Issued
            </p>
            <p className="mt-[0.8cqw] text-[clamp(0.36rem,1.9cqw,0.95rem)] font-semibold">
              {issued.latin}
            </p>
            <p
              className="text-[clamp(0.34rem,1.75cqw,0.88rem)]"
              style={{
                fontFamily: "var(--font-certificate-khmer), serif",
                color: "#3C443F",
              }}
            >
              {issued.khmer}
            </p>
          </div>
        </footer>
      </div>

      {revoked && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: "rgba(234,228,217,0.72)" }}
        >
          <p
            className="border-4 px-6 py-2 text-[clamp(0.8rem,5.5cqw,2.4rem)] font-bold uppercase"
            style={{
              borderColor: "#9C3A2E",
              color: "#9C3A2E",
              letterSpacing: "0.18em",
              transform: "rotate(-8deg)",
            }}
          >
            Revoked
          </p>
        </div>
      )}
    </article>
  )
}
