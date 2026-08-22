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
  /** FASE 6E — only meaningful for "funnel_started", omitted/undefined for every other eventType. */
  gclid?: string
  gbraid?: string
  wbraid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
  /** FASE 7E — only meaningful for "funnel_started". "resolved" | "unknown" — see the FunnelEvent model comment in schema.prisma. */
  attributionStatus?: string
}

export type RecordFunnelEventOutcome = "created" | "duplicate"

/**
 * THE ONLY WRITE PATH for FunnelEvent rows (FASE 6C, extended FASE 6D).
 * Purely mechanical: persists exactly what it is given — validation
 * (eventType allow-list, funnelSessionId format, stepKey/stepIndex
 * presence and meaning per event type, errorCode allow-list, sentinel
 * substitution) is the caller's job. Two distinct callers exist:
 * packages/domain/src/public/funnel-events/record-funnel-event.ts (client
 * payloads via POST /api/funnel/events — funnel_started/step_viewed/
 * step_completed/submit_started/submit_failed) and
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
