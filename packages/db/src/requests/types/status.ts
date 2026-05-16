/**
 * FixPro V2 - Request Status Contracts
 *
 * REQUEST DOMAIN CONTRACT
 *
 * IMPORTANT:
 * These are lifecycle contracts only.
 *
 * They are NOT:
 * - Prisma models
 * - persistence logic
 * - auth roles
 * - credit implementation
 * - moderation implementation
 */

export type RequestLifecycleStatus =
  | "draft"
  | "customer_pending"
  | "submitted"
  | "in_review"
  | "open"
  | "paused"
  | "fulfilled"
  | "cancelled"
  | "expired"

export type RequestModerationStatus =
  | "not_required"
  | "pending"
  | "approved"
  | "rejected"
  | "needs_changes"

/**
 * Future commercial readiness only.
 *
 * IMPORTANT:
 * This does NOT implement credits, refunds, or billing.
 */
export type RequestCommercialStatus =
  | "not_applicable"
  | "credit_pending"
  | "credit_authorized"
  | "refund_pending"
  | "refunded"

export type RequestVisibilityStatus =
  | "private"
  | "marketplace_visible"
  | "restricted"
  | "archived"

export type RequestStatusSnapshot = {
  lifecycleStatus: RequestLifecycleStatus
  moderationStatus: RequestModerationStatus
  visibilityStatus: RequestVisibilityStatus
  commercialStatus?: RequestCommercialStatus
  updatedAt?: Date
}
