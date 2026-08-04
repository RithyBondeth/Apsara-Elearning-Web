"use client"

import { useCallback, useEffect, useState } from "react"
import { getMyCertificates } from "@/lib/api/certificates"
import type { IApiCertificate } from "@/utils/interfaces/certificate/api.interface"

export interface IUseCertificates {
  /** Null while loading; an empty array means none earned yet (or a guest). */
  certificates: IApiCertificate[] | null
  error: boolean
  reload: () => void
}

/**
 * The learner's certificates.
 *
 * A guest or expired session resolves to an empty list rather than an error —
 * the page then shows its "nothing yet" state instead of a failure the visitor
 * can do nothing about.
 */
export function useCertificates(): IUseCertificates {
  const [certificates, setCertificates] = useState<IApiCertificate[] | null>(
    null
  )
  const [error, setError] = useState(false)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false

    getMyCertificates()
      .then((items) => {
        if (cancelled) return
        setCertificates(items)
        // Cleared on success rather than up front, so a retry doesn't blank an
        // existing error before we know the retry worked.
        setError(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setCertificates([])
        // A guest or expired session isn't an error the visitor can act on —
        // the page shows its "nothing yet" state instead.
        setError((err as { status?: number })?.status !== 401)
      })

    return () => {
      cancelled = true
    }
  }, [nonce])

  return { certificates, error, reload }
}
