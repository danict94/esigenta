/**
 * Esigenta — FASE 9J: motivi mostrati nel modal di uscita dal funnel
 *
 * FOUNDATION — PURA, NESSUN ACCESSO A DOM/RETE/DB
 *
 * Sceglie quale dei 3 elenchi fissi di reasonCode/etichetta mostrare,
 * esclusivamente in base al tipo dello step corrente e al suo indice —
 * mai in base a cosa l'utente ha già risposto. Ogni reasonCode qui usato
 * appartiene già all'allow-list server (EXIT_FEEDBACK_REASON_CODES in
 * packages/domain/.../record-funnel-event.ts, mirrorata in
 * track-funnel-event.ts) — nessun valore nuovo introdotto.
 *
 * Le 3 fasce, mutuamente esclusive:
 * - "contact": lo step è di tipo "contact" — controllato per primo perché
 *   è l'unico segnale non ambiguo (un tipo di capability preciso).
 * - "early": stepIndex 0 (il primissimo step, qualunque sia il suo tipo)
 *   OPPURE lo step è di tipo "location" — le due condizioni sono in OR,
 *   non richiedono che Location sia necessariamente il primo step.
 * - "technical": tutto il resto (step intermedi: selezioni tecniche,
 *   numero, foto, note).
 *
 * Nota: il reasonCode "not_ready" compare in due fasce con un'etichetta
 * DIVERSA ("...fare la richiesta" vs "...essere contattato" nello step
 * Contact) — per questo le 3 liste sono dichiarate per intero, non
 * derivate da una singola mappa reasonCode -> etichetta condivisa.
 */

import type { RuntimeCapability } from "@esigenta/funnel"

import type { FunnelExitFeedbackReasonCode } from "./track-funnel-event"

export type FunnelExitFeedbackReasonOption = {
  reasonCode: FunnelExitFeedbackReasonCode
  label: string
}

const EARLY_REASON_OPTIONS: FunnelExitFeedbackReasonOption[] = [
  { reasonCode: "just_browsing", label: "Stavo solo dando un'occhiata" },
  { reasonCode: "want_cost_first", label: "Vorrei prima capire quanto può costare" },
  { reasonCode: "not_ready", label: "Non sono ancora pronto a fare la richiesta" },
  { reasonCode: "dont_know_what_to_choose", label: "Non so cosa scegliere" },
  { reasonCode: "other", label: "Altro motivo" },
]

const TECHNICAL_REASON_OPTIONS: FunnelExitFeedbackReasonOption[] = [
  { reasonCode: "dont_know_what_to_choose", label: "Non so cosa scegliere" },
  { reasonCode: "too_many_questions", label: "Ci sono troppe domande" },
  { reasonCode: "want_cost_first", label: "Vorrei prima capire quanto può costare" },
  { reasonCode: "not_ready", label: "Non sono ancora pronto a fare la richiesta" },
  { reasonCode: "other", label: "Altro motivo" },
]

const CONTACT_REASON_OPTIONS: FunnelExitFeedbackReasonOption[] = [
  { reasonCode: "dont_want_to_share_contact", label: "Preferisco non lasciare i miei dati" },
  { reasonCode: "want_cost_first", label: "Vorrei prima capire quanto può costare" },
  { reasonCode: "not_ready", label: "Non sono ancora pronto a essere contattato" },
  { reasonCode: "just_browsing", label: "Stavo solo dando un'occhiata" },
  { reasonCode: "other", label: "Altro motivo" },
]

export function resolveExitFeedbackReasonOptions(
  capability: Pick<RuntimeCapability, "type">,
  stepIndex: number,
): FunnelExitFeedbackReasonOption[] {
  if (capability.type === "contact") {
    return CONTACT_REASON_OPTIONS
  }

  if (stepIndex === 0 || capability.type === "location") {
    return EARLY_REASON_OPTIONS
  }

  return TECHNICAL_REASON_OPTIONS
}
