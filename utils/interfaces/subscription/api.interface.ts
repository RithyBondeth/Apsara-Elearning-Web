export interface IApiPlan {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  billingPeriod?: "monthly" | "yearly" | "lifetime"
  aiCredits?: number
  stripePriceId?: string
  entitlements: TEntitlementKey[]
  trialDays: number
  gracePeriodDays: number
}

export interface IApiSubscription {
  id: string
  userId: string
  planId: string
  provider: string
  status: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEndsAt?: string
  graceEndsAt?: string
}

export type TEntitlementKey = "courses:premium" | "ai:tutor" | "certificates"

export interface IApiResolvedEntitlement {
  entitlement: TEntitlementKey
  granted: boolean
  source: "administrative" | "plan" | "none"
  validUntil?: string | null
}

export interface IApiActiveSubscription {
  subscription: IApiSubscription
  plan: IApiPlan
}

export interface IApiCheckoutSession {
  sessionId: string
  url: string
}

/** Mirrors PaymentResponseDTO — one row of billing history. */
export interface IApiPayment {
  id: string
  subscriptionId?: string
  amount: number
  currency?: string
  provider: string
  transactionId: string
  status: string
  refundedAmount: number
  refundStatus?: string
  createdAt: string
  updatedAt: string
}
