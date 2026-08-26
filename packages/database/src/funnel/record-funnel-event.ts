import { Prisma } from "@prisma/client"

import { prisma } from "../client"

export type RecordFunnelEventInput = {
  funnelSessionId: string
  interventionSlug: string
  eventType: string
  stepKey: string
  stepIndex: number
  /** FASE 6D — only meaningful for "submit_failed", omitted/undefined for every other eventType. */
  errorCode?: string
  /** FASE 9H — only meaningful for "exit_feedback_submitted", omitted/undefined for every other eventType. Closed allow-list, never free text — see EXIT_FEEDBACK_REASON_CODES in packages/domain/.../record-funnel-event.ts. */
  reasonCode?: string
  /** FASE 6E — only meaningful for "funnel_opened" (FASE 9A: re-anchored from "funnel_started"), omitted/undefined for every other eventType. */
  gclid?: string
  gbraid?: string
  wbraid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  /** FASE 7E — only meaningful for "funnel_opened" (FASE 9A: re-anchored from "funnel_started"). "resolved" | "unknown" — see the FunnelEvent model comment in schema.prisma. */
  attributionStatus?: string
  /** FASE 9A — legacy/V2 tracking-generation marker, meaningful for every client-submitted eventType (never request_created, written elsewhere). "v2" | omitted/undefined for a caller that predates this phase. See the trackingVersion doc comment on the FunnelEvent model in schema.prisma. */
  trackingVersion?: string
}

export type RecordFunnelEventOutcome = "created" | "duplicate"

/**
 * THE ONLY WRITE PATH for FunnelEvent rows (FASE 6C, extended FASE 6D).
 * Purely mechanical: persists exactly what it is given — validation
 * (eventType allow-list, funnelSessionId format, stepKey/stepIndex
 * presence and meaning per event type, errorCode allow-list, sentinel
 * substitution) is the caller's job. Two distinct callers exist:
 * packages/domain/src/public/funnel-events/record-funnel-event.ts (client
 * payloads via POST /api/funnel/events — funnel_opened/funnel_started/
 * step_viewed/step_completed/client_validation_failed/
 * exit_feedback_submitted/submit_started/submit_failed, FASE 9A/9E/9H) and
 * packages/domain/src/public/requests/create-request.ts (request_created,
 * written directly server-side, never from a client payload, never
 * through the validator above — see FASE 6D report).
 *
 * Dedup: relies entirely on FunnelEvent's own
 * @@unique([funnelSessionId, eventType, stepKey, stepIndex]) — a re-fired
 * identical event (re-render, refresh, retry) hits the constraint and is
 * reported back as "duplicate", never a second row and never a thrown
 * error the caller has to handle specially. This function does not know
 * or care that stepKey/stepIndex mean different things for different
 * eventTypes (funnel step vs. submit-attempt counter vs. sentinel) — see
 * the FunnelEvent model comment in schema.prisma for why that is safe.
 *
 * FASE 9H: a SECOND, unrelated unique constraint also exists in the
 * database for exit_feedback_submitted specifically (a raw partial index,
 * not expressible in schema.prisma — see that model's comment). This
 * function does not need to know about it either: any unique-constraint
 * violation, from either index, surfaces as the same Postgres 23505 ->
 * Prisma P2002 caught below, reported back as "duplicate" identically.
 */
export async function recordFunnelEvent(
  input: RecordFunnelEventInput,
): Promise<RecordFunnelEventOutcome> {
  try {
    await prisma.funnelEvent.create({
      data: {
        funnelSessionId: input.funnelSessionId,
        interventionSlug: input.interventionSlug,
        eventType: input.eventType,
        stepKey: input.stepKey,
        stepIndex: input.stepIndex,
        ...(input.errorCode ? { errorCode: input.errorCode } : {}),
        ...(input.reasonCode ? { reasonCode: input.reasonCode } : {}),
        ...(input.gclid ? { gclid: input.gclid } : {}),
        ...(input.gbraid ? { gbraid: input.gbraid } : {}),
        ...(input.wbraid ? { wbraid: input.wbraid } : {}),
        ...(input.utmSource ? { utmSource: input.utmSource } : {}),
        ...(input.utmMedium ? { utmMedium: input.utmMedium } : {}),
        ...(input.utmCampaign ? { utmCampaign: input.utmCampaign } : {}),
        ...(input.utmTerm ? { utmTerm: input.utmTerm } : {}),
        ...(input.utmContent ? { utmContent: input.utmContent } : {}),
        ...(input.attributionStatus
          ? { attributionStatus: input.attributionStatus }
          : {}),
        ...(input.trackingVersion
          ? { trackingVersion: input.trackingVersion }
          : {}),
      },
    })

    return "created"
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return "duplicate"
    }

    throw error
  }
}
