/** Mirrors CertificateResponseDTO — the learner's own certificate. */
export interface IApiCertificate {
  id: string
  courseId: string
  /** Public verification code, e.g. `APS-4K7M-QW2X-9BTF`. */
  code: string
  courseTitle: string
  courseTitleKm?: string | null
  courseSlug?: string
  issuedAt: string
  revokedAt?: string | null
}

/**
 * Mirrors CertificateVerificationResponseDTO — what an unauthenticated verifier
 * sees. Every field but `code` and `valid` is absent when the code is unknown,
 * so the API never distinguishes "no such certificate" from "revoked" by status.
 */
export interface IApiCertificateVerification {
  code: string
  valid: boolean
  learnerName?: string
  courseTitle?: string
  courseTitleKm?: string | null
  issuedAt?: string
  revokedAt?: string | null
}
