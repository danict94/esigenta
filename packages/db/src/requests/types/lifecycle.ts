/**
 * FixPro V2 - Request Lifecycle Contracts
 *
 * REQUEST DOMAIN CONTRACT
 *
 * IMPORTANT:
 * This describes lifecycle transitions and audit intent.
 *
 * It does NOT implement:
 * - persistence
 * - moderation queues
 * - notification dispatch
 * - credits
 * - refunds
 */

import type {
  RequestOwnerRef,
} from "./ownership"

import type {
  RequestLifecycleStatus,
  RequestModerationStatus,
  RequestStatusSnapshot,
} from "./status"

export type RequestLifecycleEventType =
  | "draft_created"
  | "customer_bootstrapped"
  | "submitted"
  | "ownership_claimed"
  | "moderation_requested"
  | "moderation_updated"
  | "opened_to_marketplace"
  | "paused"
  | "fulfilled"
  | "cancelled"
  | "expired"

export type RequestLifecycleEvent = {
  type: RequestLifecycleEventType
  actor?: RequestOwnerRef
  fromStatus?: RequestLifecycleStatus
  toStatus?: RequestLifecycleStatus
  moderationStatus?: RequestModerationStatus
  reason?: string
  occurredAt: Date
}

export type RequestLifecycleSnapshot = {
  requestId?: string
  status: RequestStatusSnapshot
  events: RequestLifecycleEvent[]
}
