import { apiGet, apiPost } from "./client"
import type {
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
