/**
 * Esigenta V2 - Request Creation Contracts
 *
 * REQUEST DOMAIN CONTRACT
 *
 * IMPORTANT:
 * Creation starts from a funnel-generated RequestDraft.
 *
 * The funnel owns acquisition.
 * The request domain owns lifecycle and ownership.
 *
 * This file does NOT implement persistence.
 */

import type {
  RequestDraft,
} from "../../funnel/types/request-draft"

import type {
  CustomerBootstrapInput,
  RequestOwnershipSnapshot,
} from "./ownership"

import type {
  RequestLifecycleSnapshot,
} from "./lifecycle"

import type {
  RequestStatusSnapshot,
} from "./status"

export type CreateRequestInput = {
  draft: RequestDraft
  customerBootstrap?: CustomerBootstrapInput
  ownership?: RequestOwnershipSnapshot
}

export type CreateRequestPreparedPayload = {
  /**
   * Future persisted request id.
   *
   * Optional before persistence exists.
   */
  requestId?: string

  draft: RequestDraft
  status: RequestStatusSnapshot
  ownership: RequestOwnershipSnapshot
  lifecycle: RequestLifecycleSnapshot
}

export type RequestCreationReadiness = {
  canPersist: boolean
  missingFields: string[]
  warnings: string[]
}
