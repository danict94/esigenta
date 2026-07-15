/**
 * Commercial SEMANTICS now live in @esigenta/domain (single definition).
 * This module re-exports them and keeps only the presentation-layer
 * formatting (Italian UI copy), which is app-specific.
 */

export {
  getRequestCommercialState,
} from "@esigenta/domain";

export type {
  RequestCommercialFields,
  RequestCommercialState,
} from "@esigenta/domain";

export {
  formatCreditCost,
  formatUnlockAvailability,
} from "./request-commercial-format";
