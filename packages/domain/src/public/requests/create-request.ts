import { Prisma } from "@prisma/client"

import { validateRequestPhotoAnswer } from "@esigenta/uploads"
import type { RequestPhotoMetadata } from "@esigenta/uploads"

import {
  prisma,
  recordFunnelEvent as writeFunnelEvent,
  setRequestLocationWithClient,
} from "@esigenta/database"
import { isFreshGeoPlace, type GeoPlace } from "@esigenta/shared"

import type { RequestDraft } from "@esigenta/funnel"
import { buildRuntimeContactName, normalizeRuntimeText } from "@esigenta/funnel"

import { deriveLeadValue } from "../../lead-value"
import { createCommercialSnapshotFromLeadValue } from "../../commercial"
import { RequestFlowError } from "../../internal/request/request-errors"
import { createRequestVerificationToken } from "../../internal/request/verification-token"
import { sendRequestVerificationEmail } from "../../internal/request/send-verification-email"
import { toRequestStructuredData } from "../../internal/request/request-structured-data"
import { createRequestVerificationAccessToken } from "../../internal/request/customer-access-token"
import { generateUniqueRequestCode } from "../../internal/request/request-code"
import { buildRequestVerificationUrl } from "../../internal/request/request-links"
import {
  FUNNEL_EVENT_STEP_SENTINEL_INDEX,
  FUNNEL_EVENT_STEP_SENTINEL_KEY,
  REQUEST_CREATED_EVENT_TYPE,
} from "../funnel-events"

export type CreateRequestFromDraftInput = {
  draft: RequestDraft
  /**
   * FASE 6B: id opaco già normalizzato dal chiamante (vedi
   * ./funnel-session-id.ts) — mai un requisito della Request, solo
   * diagnostico. undefined se assente o non nel formato atteso.
   */
  funnelSessionId?: string
}

export type CreateRequestFromDraftResult = {
  requestId: string
  status: "PENDING_VERIFICATION"
  verificationEmailSent: boolean
  verificationEmailProvider: "resend"
  /** Snapshot tassonomico già risolto/validato in questa stessa chiamata — mai da rifidare lato client (es. per Analytics). */
  interventionSlug: string
  serviceGroupSlug: string | null
}

// --- FASE 7B: idempotency on Request.submissionSessionId (see the
// column comment on schema.prisma's Request model + the FASE 7B report) ---

/**
 * Looks up an already-created Request for this funnelSessionId. Used
 * twice: (1) as a fast, indexed pre-check before even starting the
 * creation transaction — covers the common sequential-retry case (the
 * first Request already fully committed by the time the retry arrives)
 * without ever touching photo attachment, since a retry must never
 * attempt to re-attach already-ATTACHED photos (see FASE 7A report §8);
 * (2) after catching a submissionSessionId P2002 collision from a
 * genuine concurrent race, to recover the winning Request. Selects only
 * what toIdempotentRetryResult needs to build a normal-looking success
 * response.
 */
async function findRequestBySubmissionSessionId(
  submissionSessionId: string,
): Promise<{
  id: string
  interventionSlug: string | null
  serviceGroupSlug: string | null
} | null> {
  const existing = await prisma.request.findUnique({
    where: { submissionSessionId },
    select: {
      id: true,
      interventionSlug: true,
      intervention: { select: { projectGroup: { select: { slug: true } } } },
    },
  })

  if (!existing) {
    return null
  }

  return {
    id: existing.id,
    interventionSlug: existing.interventionSlug,
    serviceGroupSlug: existing.intervention?.projectGroup?.slug ?? null,
  }
}

/**
 * A retry recovering an existing Request must look exactly like a normal
 * success to every caller (submitRuntimeRequest, the API route, the
 * client) — see FASE 7B report §11. Two deliberate simplifications, both
 * explained here and safe within this phase's scope:
 * - status is always reported as "PENDING_VERIFICATION" (the literal type
 *   this function has always returned), even on the astronomically rare
 *   chance the customer already verified their email in the gap between
 *   the original request and a very late retry — the client never
 *   branches on this field, only on requestId/verificationEmailSent/
 *   interventionSlug/serviceGroupSlug (see request-stepper.tsx /
 *   request-step-ui.tsx).
 * - verificationEmailSent is always reported as `false` (FASE 7B.1 —
 *   revised from FASE 7B's original `true`, which was flagged as an
 *   invented certainty and is no longer correct). Nothing in the data
 *   model records whether the ORIGINAL send attempt succeeded — a
 *   CustomerAccessToken row for REQUEST_VERIFICATION exists on every
 *   Request unconditionally (it's created inside the same transaction as
 *   the Request itself, before the email is ever attempted), so its mere
 *   presence proves nothing about delivery. Rather than fabricate a
 *   confirmed-success value we cannot know, `false` is read literally as
 *   "this call did not itself send or confirm an email" — which is always
 *   true for a retry, regardless of what the original call's send attempt
 *   did. This is a deliberate, minimal choice within the existing boolean
 *   contract, not a new architecture: no new column, no new lookup.
 *   Fixing a genuinely failed original send stays out of scope — the
 *   existing admin recovery paths (resendRequestVerificationEmail,
 *   verifyRequestManually) already cover it, and this function never
 *   triggers a second send on its own.
 */
export function toIdempotentRetryResult(
  existing: {
    id: string
    interventionSlug: string | null
    serviceGroupSlug: string | null
  },
  fallbackInterventionSlug: string,
): CreateRequestFromDraftResult {
  return {
    requestId: existing.id,
    status: "PENDING_VERIFICATION",
    verificationEmailSent: false,
    verificationEmailProvider: "resend",
    interventionSlug: existing.interventionSlug ?? fallbackInterventionSlug,
    serviceGroupSlug: existing.serviceGroupSlug,
  }
}

/**
 * True only for a P2002 raised specifically by
 * Request.submissionSessionId — never swallows any other unique-constraint
 * violation (e.g. a genuine requestCode collision, which would be a
 * different bug). Even if this were ever imprecise, the caller only
 * treats it as a real collision when findRequestBySubmissionSessionId
 * actually finds a matching row — any other P2002 falls through and
 * re-throws unchanged.
 *
 * FASE 7B.1: checks error.meta.target first (array of field names or a
 * constraint-name string, depending on Prisma version), but that alone was
 * NOT enough — confirmed against a real concurrent-race smoke test against
 * production Postgres, where @prisma/adapter-pg (driver adapters, this
 * repo's setup — see packages/database/src/client.ts) reported P2002 with
 * `meta: { modelName: 'Request', driverAdapterError: [Error] }` and NO
 * `target` at all. The field name is still always present in Prisma's own
 * human-readable message ("Unique constraint failed on the fields:
 * (`submissionSessionId`)"), which is driver/version-independent (it's
 * Prisma's own formatting, not the raw driver error) — so that is the
 * primary, reliable signal; meta.target is kept as a secondary check for
 * any future/older Prisma setup that does populate it.
 */
export function isSubmissionSessionIdCollision(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false
  }

  if (error.code !== "P2002") {
    return false
  }

  if (error.message.includes("submissionSessionId")) {
    return true
  }

  const target = error.meta?.target
  const targetText = Array.isArray(target) ? target.join(",") : String(target ?? "")

  return targetText.includes("submissionSessionId")
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value: string): boolean {
  return /^[+\d][+\d\s().-]{5,}$/.test(value)
}

/**
 * Resolves Request.interventionId from the same canonical
 * draft.interventionSlug already stored as the interventionSlug snapshot —
 * no second/independent intent signal. The funnel orchestration layer
 * (resolveInterventionForFunnel) already validates this slug resolves to a
 * live Intervention before a draft can ever be built, so this should never
 * realistically throw — guarded anyway, mirroring resolveRequiredServiceIds
 * above. See docs/archive-legacy/refoundation/taxonomy-refoundation/10_REQUEST_PERSISTENCE_AUDIT.md.
 */
async function resolveIntervention(
  interventionSlug: string,
): Promise<{ id: string; groupSlug: string | null }> {
  const intervention = await prisma.intervention.findUnique({
    where: { slug: interventionSlug },
    select: { id: true, projectGroup: { select: { slug: true } } },
  })

  if (!intervention) {
    throw new RequestFlowError({
      code: "invalid_intervention",
      message: "Intervention could not be resolved for the request.",
      statusCode: 400,
    })
  }

  return {
    id: intervention.id,
    groupSlug: intervention.projectGroup?.slug ?? null,
  }
}

function validateDraftForCreation(draft: RequestDraft): {
  customerEmail: string
  customerName?: string
  customerPhone?: string
} {
  if (!draft.interventionSlug.trim()) {
    throw new RequestFlowError({
      code: "missing_intervention",
      message: "Request requires a resolved intervention.",
      statusCode: 400,
    })
  }

  const customerEmail = normalizeRuntimeText(draft.contact.email)?.toLowerCase()

  if (!customerEmail || !isValidEmail(customerEmail)) {
    throw new RequestFlowError({
      code: "invalid_customer_email",
      message: "A valid email is required to confirm the request.",
      statusCode: 400,
    })
  }

  const customerFirstName = normalizeRuntimeText(draft.contact.firstName)
  const customerLastName = normalizeRuntimeText(draft.contact.lastName)

  if (
    (customerFirstName && !customerLastName) ||
    (!customerFirstName && customerLastName)
  ) {
    throw new RequestFlowError({
      code: "invalid_customer_name",
      message: "Nome e cognome sono richiesti.",
      statusCode: 400,
    })
  }

  const customerName = normalizeRuntimeText(
    buildRuntimeContactName({
      firstName: customerFirstName,
      lastName: customerLastName,
      name: normalizeRuntimeText(draft.contact.name),
    }),
  )

  if (!customerName) {
    throw new RequestFlowError({
      code: "invalid_customer_name",
      message: "Nome e cognome sono richiesti.",
      statusCode: 400,
    })
  }

  const customerPhone = normalizeRuntimeText(draft.contact.phone)

  if (customerPhone && !isValidPhone(customerPhone)) {
    throw new RequestFlowError({
      code: "invalid_customer_phone",
      message: "Phone number format is not valid.",
      statusCode: 400,
    })
  }

  return {
    customerEmail,
    ...(customerName ? { customerName } : {}),
    ...(customerPhone ? { customerPhone } : {}),
  }
}

function validateGeoForCreation(draft: RequestDraft): GeoPlace {
  if (!isFreshGeoPlace(draft.geo)) {
    throw new RequestFlowError({
      code: "invalid_request_location",
      message: "A normalized request location is required.",
      statusCode: 400,
    })
  }

  return draft.geo
}

function validateRequestPhotosForCreation(draft: RequestDraft): {
  draft: RequestDraft
  photos: RequestPhotoMetadata[]
} {
  const validation = validateRequestPhotoAnswer(draft.rawAnswers.photos)

  if (!validation.ok) {
    throw new RequestFlowError({
      code: "invalid_request_photos",
      message: "Uploaded request photos are not valid.",
      statusCode: 400,
    })
  }

  const rawAnswers = { ...draft.rawAnswers }

  if (validation.photos.length > 0) {
    rawAnswers.photos = validation.photos
  } else {
    delete rawAnswers.photos
  }

  return {
    draft: { ...draft, rawAnswers },
    photos: validation.photos,
  }
}

async function attachRequestPhotos({
  tx,
  requestId,
  photos,
}: {
  tx: Prisma.TransactionClient
  requestId: string
  photos: RequestPhotoMetadata[]
}) {
  if (photos.length === 0) return

  const uploadIds = photos.map((photo) => photo.uploadId)

  const pendingPhotos = await tx.requestPhoto.findMany({
    where: {
      uploadId: { in: uploadIds },
      requestId: null,
      status: "TEMPORARY",
    },
    select: {
      uploadId: true,
      fileKey: true,
      fileName: true,
      mimeType: true,
      sizeBytes: true,
    },
  })

  const pendingByUploadId = new Map(
    pendingPhotos.map((photo) => [photo.uploadId, photo]),
  )

  const arePhotosPending = photos.every((photo) => {
    const pending = pendingByUploadId.get(photo.uploadId)
    return Boolean(
      pending &&
        pending.fileKey === photo.fileKey &&
        pending.fileName === photo.fileName &&
        pending.mimeType === photo.mimeType &&
        pending.sizeBytes === photo.sizeBytes,
    )
  })

  if (!arePhotosPending) {
    throw new RequestFlowError({
      code: "invalid_request_photos",
      message: "One or more request photos cannot be attached.",
      statusCode: 400,
    })
  }

  const attached = await tx.requestPhoto.updateMany({
    where: {
      uploadId: { in: uploadIds },
      requestId: null,
      status: "TEMPORARY",
    },
    data: {
      requestId,
      status: "ATTACHED",
      attachedAt: new Date(),
    },
  })

  if (attached.count !== photos.length) {
    throw new RequestFlowError({
      code: "invalid_request_photos",
      message: "One or more request photos cannot be attached.",
      statusCode: 400,
    })
  }
}

export async function createRequestFromDraft({
  draft,
  funnelSessionId,
}: CreateRequestFromDraftInput): Promise<CreateRequestFromDraftResult> {
  // FASE 7B: fast-path idempotency check. Covers the common sequential
  // retry (the original Request already committed by the time this call
  // arrives) — cheap, indexed, and crucially runs BEFORE any photo
  // validation/attachment, so a retry can never hit the photo-attach race
  // described in the FASE 7A report §8. A true concurrent race (two
  // submits arriving before either commits) is NOT prevented by this
  // check alone — see the P2002 handling around the transaction below,
  // which is the actual database-enforced guarantee (see FASE 7B report
  // §6, "Concorrenza").
  if (funnelSessionId) {
    const existingRequest = await findRequestBySubmissionSessionId(funnelSessionId)

    if (existingRequest) {
      console.info(
        "[createRequestFromDraft] Idempotent retry — returning existing Request",
        { requestId: existingRequest.id, funnelSessionId },
      )

      return toIdempotentRetryResult(existingRequest, draft.interventionSlug)
    }
  }

  const preparedPhotos = validateRequestPhotosForCreation(draft)
  const persistedDraft = preparedPhotos.draft
  const customer = validateDraftForCreation(persistedDraft)
  const geo = validateGeoForCreation(persistedDraft)

  const [intervention, requestCode] = await Promise.all([
    resolveIntervention(persistedDraft.interventionSlug),
    generateUniqueRequestCode(),
  ])

  const verification = createRequestVerificationToken()

  // Commercial lead value derived at creation from the normalized request
  // signals (single extractor → deriveLeadValue). Populates creditCost /
  // maxUnlocks; the admin can still override via request-commercial-settings.
  const leadValue = deriveLeadValue({
    interventionSlug: persistedDraft.interventionSlug,
    groupSlug: intervention.groupSlug ?? "",
    structuredData: { draft: persistedDraft },
  })

  // RequestRequiredService is no longer written here (Phase 14): its last
  // real reader, the company browse dashboard
  // (get-requests-list-page.ts), was rewritten onto
  // Request.interventionId + CompanyIntervention — see
  // docs/archive-legacy/refoundation/taxonomy-refoundation/14_DISCOVERY_AND_VISIBILITY_CUTOVER_REPORT.md.
  // The admin moderation detail view's requiredServices display already
  // falls back to the live Intervention->Service derivation when empty.
  const data: Omit<Prisma.RequestCreateInput, "customer"> = {
    status: "PENDING_VERIFICATION",
    requestCode,
    interventionSlug: persistedDraft.interventionSlug,
    intervention: { connect: { id: intervention.id } },
    customerEmail: customer.customerEmail,
    structuredData: toRequestStructuredData({
      draft: persistedDraft,
      ...(funnelSessionId ? { funnelSessionId } : {}),
    }),
    // FASE 7B: the real, database-enforced idempotency key — see the
    // column comment on Request.submissionSessionId in schema.prisma and
    // the P2002 handling around the transaction below. Deliberately a
    // separate column from the structuredData copy above: that one is
    // diagnostic only and was never enforced.
    ...(funnelSessionId ? { submissionSessionId: funnelSessionId } : {}),
    // Effective commercial values (read by unlock/listings). At creation
    // effective = auto, so they equal the snapshot's creditCost/maxUnlocks.
    creditCost: leadValue.creditCost,
    maxUnlocks: leadValue.maxUnlocks,
    // Automatic monetization snapshot (frozen at creation; preserved across
    // any later admin override). Kept separate from structuredData.
    commercialSnapshot: createCommercialSnapshotFromLeadValue(leadValue),
  }

  if (customer.customerName) data.customerName = customer.customerName
  if (customer.customerPhone) data.customerPhone = customer.customerPhone

  let request: { id: string; status: string }

  try {
    request = await prisma.$transaction(async (tx) => {
      const persistedCustomer = await tx.customer.upsert({
        where: { email: customer.customerEmail },
        create: {
          email: customer.customerEmail,
          ...(customer.customerName ? { name: customer.customerName } : {}),
          ...(customer.customerPhone ? { phone: customer.customerPhone } : {}),
        },
        update: {
          ...(customer.customerName ? { name: customer.customerName } : {}),
          ...(customer.customerPhone ? { phone: customer.customerPhone } : {}),
        },
        select: { id: true },
      })

      const createdRequest = await tx.request.create({
        data: {
          ...data,
          customer: { connect: { id: persistedCustomer.id } },
        },
        select: { id: true, status: true },
      })

      await setRequestLocationWithClient(tx, createdRequest.id, geo)

      await attachRequestPhotos({
        tx,
        requestId: createdRequest.id,
        photos: preparedPhotos.photos,
      })

      await createRequestVerificationAccessToken({
        tx,
        email: customer.customerEmail,
        requestId: createdRequest.id,
        tokenHash: verification.tokenHash,
        expiresAt: verification.expiresAt,
      })

      return createdRequest
    })
  } catch (error) {
    // FASE 7B: lost a genuine concurrent race on submissionSessionId — the
    // whole transaction above rolled back atomically (Customer upsert
    // included), and crucially never reached attachRequestPhotos: the
    // unique violation fires at tx.request.create() itself, the very
    // first write inside the transaction, before any photo attach is even
    // attempted (see FASE 7B report §6/§8 — this is what keeps the losing
    // side of a race from ever touching photos at all). The winning
    // transaction is guaranteed committed and visible by the time
    // Postgres reports this conflict back to us, so recovering it here is
    // always safe.
    if (funnelSessionId && isSubmissionSessionIdCollision(error)) {
      const existingRequest = await findRequestBySubmissionSessionId(funnelSessionId)

      if (existingRequest) {
        console.info(
          "[createRequestFromDraft] Idempotent retry (concurrent race) — returning existing Request",
          { requestId: existingRequest.id, funnelSessionId },
        )

        return toIdempotentRetryResult(existingRequest, persistedDraft.interventionSlug)
      }
    }

    throw error
  }

  // FASE 6B: unico log di successo dell'intero percorso di creazione — oggi
  // esistevano solo log di fallimento (vedi submit-runtime-request.ts). Solo
  // supporto diagnostico, mai la fonte primaria della persistenza (la
  // Request già esiste, questa riga non la "conferma"). Deliberatamente
  // niente email/telefono/indirizzo/note/altri dati del form: solo i tre
  // identificatori opachi richiesti.
  console.info("[createRequestFromDraft] Request created", {
    requestId: request.id,
    funnelSessionId: funnelSessionId ?? null,
    interventionSlug: persistedDraft.interventionSlug,
  })

  // FASE 6D: request_created è l'unico FunnelEvent scritto qui, mai dal
  // client — vedi packages/domain/src/public/funnel-events/record-funnel-event.ts
  // per il perché. Best-effort, come l'invio email sotto: la transazione
  // che crea la Request è già committata sopra, un fallimento qui non deve
  // mai retrocedere né far sembrare la richiesta non creata. Nessuna
  // scrittura se il client non ha mai mandato un funnelSessionId valido —
  // non c'è nulla di significativo da correlare.
  if (funnelSessionId) {
    try {
      await writeFunnelEvent({
        funnelSessionId,
        interventionSlug: persistedDraft.interventionSlug,
        eventType: REQUEST_CREATED_EVENT_TYPE,
        stepKey: FUNNEL_EVENT_STEP_SENTINEL_KEY,
        stepIndex: FUNNEL_EVENT_STEP_SENTINEL_INDEX,
      })
    } catch (error) {
      console.error(
        "[createRequestFromDraft] request_created telemetry failed",
        {
          requestId: request.id,
          errorName: error instanceof Error ? error.name : "UnknownError",
        },
      )
    }
  }

  const verificationUrl = buildRequestVerificationUrl({
    token: verification.token,
  })

  // La transazione sopra è già committata: la richiesta esiste, con ID e
  // token definitivi. Un fallimento dell'invio email da qui in poi non deve
  // mai retrocedere a un errore che farebbe credere al chiamante che la
  // richiesta non sia stata creata — quel falso negativo è esattamente ciò
  // che spinge un utente a riprovare e creare una seconda Request reale.
  // Log volutamente minimo: né error.message né error.stack, perché il
  // messaggio di errore di un provider email può incorporare l'indirizzo
  // del destinatario o altri dettagli non controllabili da qui.
  let verificationEmailSent = false

  try {
    const emailResult = await sendRequestVerificationEmail({
      to: customer.customerEmail,
      verificationUrl,
    })

    verificationEmailSent = emailResult.sent
  } catch (error) {
    console.error(
      "[createRequestFromDraft] Verification email failed after commit",
      {
        operation: "send_request_verification_email",
        provider: "resend",
        requestId: request.id,
        errorName: error instanceof Error ? error.name : "UnknownError",
      },
    )
  }

  return {
    requestId: request.id,
    status: "PENDING_VERIFICATION",
    verificationEmailSent,
    verificationEmailProvider: "resend",
    interventionSlug: persistedDraft.interventionSlug,
    serviceGroupSlug: intervention.groupSlug,
  }
}
