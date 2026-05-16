/**
 * FixPro V2 - Request Ownership Contracts
 *
 * REQUEST DOMAIN CONTRACT
 *
 * IMPORTANT:
 * Ownership is intentionally not tied to a rigid role system.
 *
 * Future flows may include:
 * - visitor bootstrap
 * - customer claim
 * - professional/company interactions
 * - system moderation
 *
 * This file does NOT implement auth.
 */

import type {
  RequestContactDraft,
} from "../../funnel/types/request-draft"

export type RequestOwnerSubjectType =
  | "visitor"
  | "customer"
  | "professional"
  | "company"
  | "system"

export type RequestOwnerRef = {
  subjectType: RequestOwnerSubjectType

  /**
   * Future persisted identity id.
   *
   * Optional because MVP flow starts as visitor-first.
   */
  subjectId?: string

  /**
   * Lightweight visitor/session correlation.
   *
   * Not an auth implementation.
   */
  anonymousSessionId?: string
}

export type RequestOwnershipSnapshot = {
  /**
   * Primary request owner once known.
   */
  owner?: RequestOwnerRef

  /**
   * Actor that originally submitted the request.
   */
  submittedBy?: RequestOwnerRef

  /**
   * Whether a visitor-created request can later be claimed.
   */
  claimable: boolean

  claimedAt?: Date
}

export type CustomerBootstrapInput = {
  /**
   * Contact data collected by the funnel draft.
   */
  contact?: RequestContactDraft

  /**
   * Optional visitor correlation for future claim/auth flow.
   */
  anonymousSessionId?: string

  /**
   * Future verification hint only.
   */
  preferredVerification?:
    | "email"
    | "phone"
    | "none"
}
