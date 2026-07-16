import type { Prisma } from "@prisma/client"

import { validateRequestPhotoAnswer } from "@esigenta/uploads"
import type { RequestPhotoMetadata } from "@esigenta/uploads"

import { prisma, setRequestLocationWithClient } from "@esigenta/database"
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

export type CreateRequestFromDraftInput = {
  draft: RequestDraft
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
}: CreateRequestFromDraftInput): Promise<CreateRequestFromDraftResult> {
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
    structuredData: toRequestStructuredData({ draft: persistedDraft }),
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

  const request = await prisma.$transaction(async (tx) => {
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
