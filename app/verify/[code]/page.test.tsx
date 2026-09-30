import { Suspense } from "react"
import { act, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { IApiCertificateVerification } from "@/utils/interfaces/certificate/api.interface"

let result: IApiCertificateVerification

vi.mock("@/lib/api/certificates", () => ({
  verifyCertificate: () => Promise.resolve(result),
}))
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }))
vi.mock("@/components/landing/landing-navbar", () => ({
  LandingNavbar: () => null,
}))
vi.mock("@/components/landing/landing-footer", () => ({
  LandingFooter: () => null,
}))
vi.mock("@/components/certificate/certificate-sheet", () => ({
  CertificateSheet: () => <div>certificate-sheet</div>,
}))
vi.mock("@/components/certificate/certificate-actions", () => ({
  CertificateActions: () => null,
}))
vi.mock("@/lib/fonts/certificate", () => ({ certificateFontClass: "" }))

import VerifyCertificatePage from "./page"

/* `use(params)` suspends on the first render; an async act lets React
   resolve the promise and render the page before assertions run. */
const renderFor = async (code: string) => {
  const params = Promise.resolve({ code })
  await act(async () => {
    render(
      <Suspense fallback={null}>
        <VerifyCertificatePage params={params} />
      </Suspense>
    )
  })
}

describe("certificate verification page", () => {
  it("says a revoked certificate was withdrawn, not that it doesn't exist", async () => {
    result = {
      code: "APS-7E2E-TEST-0001",
      valid: false,
      revokedAt: "2026-09-30T00:00:00Z",
    }
    await renderFor("APS-7E2E-TEST-0001")
    expect(await screen.findByText("revokedTitle")).toBeInTheDocument()
    expect(screen.getByText("revokedBody")).toBeInTheDocument()
    expect(screen.queryByText("invalidTitle")).not.toBeInTheDocument()
  })

  it("says an unknown code matches nothing", async () => {
    result = { code: "APS-0000-0000-0000", valid: false }
    await renderFor("APS-0000-0000-0000")
    expect(await screen.findByText("invalidTitle")).toBeInTheDocument()
    expect(screen.getByText("invalidBody")).toBeInTheDocument()
  })
})
