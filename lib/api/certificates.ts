import { apiGet, apiPost } from "./client"
import type {
  IApiCertificate,
  IApiCertificateVerification,
} from "@/utils/interfaces/certificate/api.interface"

/** The signed-in learner's certificates, newest first. */
export const getMyCertificates = () =>
  apiGet<IApiCertificate[]>("/certificate")

/**
 * Issues or returns the certificate for a completed course.
 *
 * Idempotent — the backend also issues automatically when the last lesson
 * lands, so this is for the learner who finished a course before subscribing.
 * Throws 400 while the course is unfinished and 403 without the entitlement.
 */
export const claimCertificate = (courseId: string) =>
  apiPost<IApiCertificate>(`/certificate/course/${courseId}`)

/**
 * Public verification — no session required, which is the whole point: an
 * employer holding the code can check it without an account.
 *
 * Never 404s for an unknown code; it resolves with `valid: false`.
 */
export const verifyCertificate = (code: string) =>
  apiGet<IApiCertificateVerification>(
    `/certificate/verify/${encodeURIComponent(code)}`
  )
