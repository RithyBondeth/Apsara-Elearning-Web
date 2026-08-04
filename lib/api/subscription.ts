import { apiDelete, apiGet, apiPost } from "./client"
import type {
  IApiPayment,
  IApiSubscription,
  IApiActiveSubscription,
  IApiCheckoutSession,
  IApiPlan,
  IApiResolvedEntitlement,
} from "@/utils/interfaces/subscription/api.interface"

export const getSubscriptionPlans = () =>
  apiGet<IApiPlan[]>("/subscription/plans")

export const getActiveSubscription = () =>
  apiGet<IApiActiveSubscription | null>("/subscription/me")

export const getEntitlements = () =>
  apiGet<IApiResolvedEntitlement[]>("/subscription/entitlements")

export const createCheckoutSession = (planId: string) =>
  apiPost<IApiCheckoutSession>("/subscription/checkout", { planId })

export const createBillingPortalSession = () =>
  apiPost<{ url: string }>("/subscription/billing-portal")

/** Past payments, for the billing history. */
export const getPaymentHistory = () =>
  apiGet<IApiPayment[]>("/subscription/payments")

/** Every subscription the learner has held, current one included. */
export const getSubscriptionHistory = () =>
  apiGet<IApiSubscription[]>("/subscription/history")

/**
 * Cancels at the end of the paid period rather than immediately — the learner
 * keeps what they paid for until it runs out.
 */
export const cancelSubscription = (id: string) =>
  apiDelete<IApiSubscription>(`/subscription/${id}`)
