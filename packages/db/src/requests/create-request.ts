/**
 * Esigenta V2 - Request Creation Flow
 *
 * Backend flow:
 * RequestDraft -> Request(PENDING_VERIFICATION) -> verification email.
 *
 * Customer remains a soft identity.
 * No auth, no password, no User creation.
 */

import type {
  Prisma,
} from "@prisma/client"

import {
  validateRequestPhotoAnswer,
} from "@esigenta/uploads"

import type {
  RequestPhotoMetadata,
} from "@esigenta/uploads"

import { prisma } from "../prisma/client"

import type {
  RequestDraft,
} from "../funnel/types/request-draft"

import {
  buildRuntimeContactName,
  normalizeRuntimeText,
} from "../funnel/normalization"

import {
  RequestFlowError,
} from "./request-errors"

import {
  createRequestVerificationToken,
} from "./verification-token"

import {
  sendRequestVerificationEmail,
} from "./send-verification-email"

import {
  toRequestStructuredData,
} from "./request-structured-data"

import {
  createRequestVerificationAccessToken,
} from "./customer-access-token"

import {
  generateUniqueRequestCode,
} from "./request-code"

import {
  buildRequestVerificationUrl,
} from "./request-links"

export type CreateRequestFromDraftInput = {
  draft: RequestDraft
}

export type CreateRequestFromDraftResult = {
  requestId: string
  status: "PENDING_VERIFICATION"
  verificationEmailSent: boolean
  verificationEmailProvider: "resend"
}

function isValidEmail(
  value: string,
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value,
  )
}

function isValidPhone(
  value: string,
): boolean {
  return /^[+\d][+\d\s().-]{5,}$/.test(
    value,
  )
}

function isValidLatitude(
  value: number | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -90 &&
    value <= 90
  )
}

function isValidLongitude(
  value: number | undefined,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= -180 &&
    value <= 180
  )
}

async function resolveRequiredServiceIds(
  serviceSlugs: string[],
): Promise<string[]> {
  const uniqueSlugs =
    Array.from(new Set(serviceSlugs))

  if (uniqueSlugs.length === 0) {
    throw new RequestFlowError({
      code: "missing_required_services",
      message:
        "Request requires at least one required service snapshot.",
      statusCode: 400,
    })
  }

  const services =
    await prisma.service.findMany({
      where: {
        slug: {
          in: uniqueSlugs,
        },
      },
      select: {
        id: true,
        slug: true,
      },
    })

  if (services.length !== uniqueSlugs.length) {
    throw new RequestFlowError({
      code: "invalid_required_services",
      message:
        "One or more required services could not be resolved.",
      statusCode: 400,
    })
  }

  return services.map(
    (service) => service.id,
  )
}

function validateDraftForCreation(
  draft: RequestDraft,
): {
  customerEmail: string
  customerName?: string
  customerPhone?: string
} {
  if (!draft.interventionSlug.trim()) {
    throw new RequestFlowError({
      code: "missing_intervention",
      message:
        "Request requires a resolved intervention.",
      statusCode: 400,
    })
  }

  const customerEmail =
    normalizeRuntimeText(
      draft.contact.email,
    )?.toLowerCase()

  if (
    !customerEmail ||
    !isValidEmail(customerEmail)
  ) {
    throw new RequestFlowError({
      code: "invalid_customer_email",
      message:
        "A valid email is required to confirm the request.",
      statusCode: 400,
    })
  }

  const customerFirstName =
    normalizeRuntimeText(
      draft.contact.firstName,
    )

  const customerLastName =
    normalizeRuntimeText(
      draft.contact.lastName,
    )

  if (
    (customerFirstName &&
      !customerLastName) ||
    (!customerFirstName &&
      customerLastName)
  ) {
    throw new RequestFlowError({
      code: "invalid_customer_name",
      message:
        "Nome e cognome sono richiesti.",
      statusCode: 400,
    })
  }

  const customerName =
    normalizeRuntimeText(
      buildRuntimeContactName({
        firstName:
          customerFirstName,
        lastName:
          customerLastName,
        name:
          normalizeRuntimeText(
            draft.contact.name,
          ),
      }),
    )

  if (!customerName) {
    throw new RequestFlowError({
      code: "invalid_customer_name",
      message:
        "Nome e cognome sono richiesti.",
      statusCode: 400,
    })
  }

  const customerPhone =
    normalizeRuntimeText(
      draft.contact.phone,
    )

  if (
    customerPhone &&
    !isValidPhone(customerPhone)
  ) {
    throw new RequestFlowError({
      code: "invalid_customer_phone",
      message:
        "Phone number format is not valid.",
      statusCode: 400,
    })
  }

  return {
    customerEmail,
    ...(customerName
      ? {
          customerName,
        }
      : {}),
    ...(customerPhone
      ? {
          customerPhone,
        }
      : {}),
  }
}

function validateGeoForCreation(
  draft: RequestDraft,
): {
  address: string
  city: string
  postalCode?: string
  latitude: number
  longitude: number
} {
  const address =
    normalizeRuntimeText(
      draft.geo.address,
    )

  const city =
    normalizeRuntimeText(
      draft.geo.city,
    )

  const postalCode =
    normalizeRuntimeText(
      draft.geo.postalCode,
    )

  if (
    !address ||
    !city ||
    !isValidLatitude(
      draft.geo.latitude,
    ) ||
    !isValidLongitude(
      draft.geo.longitude,
    )
  ) {
    throw new RequestFlowError({
      code: "invalid_request_location",
      message:
        "A normalized request location is required.",
      statusCode: 400,
    })
  }

  return {
    address,
    city,
    latitude:
      draft.geo.latitude,
    longitude:
      draft.geo.longitude,
    ...(postalCode
      ? {
          postalCode,
        }
      : {}),
  }
}

function validateRequestPhotosForCreation(
  draft: RequestDraft,
): {
  draft: RequestDraft
  photos: RequestPhotoMetadata[]
} {
  const validation =
    validateRequestPhotoAnswer(
      draft.rawAnswers.photos,
    )

  if (!validation.ok) {
    throw new RequestFlowError({
      code: "invalid_request_photos",
      message:
        "Uploaded request photos are not valid.",
      statusCode: 400,
    })
  }

  const rawAnswers = {
    ...draft.rawAnswers,
  }

  if (validation.photos.length > 0) {
    rawAnswers.photos =
      validation.photos
  } else {
    delete rawAnswers.photos
  }

  return {
    draft: {
      ...draft,
      rawAnswers,
    },
    photos:
      validation.photos,
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
  if (photos.length === 0) {
    return
  }

  const uploadIds =
    photos.map((photo) => photo.uploadId)

  const pendingPhotos =
    await tx.requestPhoto.findMany({
      where: {
        uploadId: {
          in: uploadIds,
        },
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

  const pendingByUploadId =
    new Map(
      pendingPhotos.map(
        (photo) => [
          photo.uploadId,
          photo,
        ],
      ),
    )

  const arePhotosPending =
    photos.every((photo) => {
      const pending =
        pendingByUploadId.get(
          photo.uploadId,
        )

      return Boolean(
        pending &&
          pending.fileKey ===
            photo.fileKey &&
          pending.fileName ===
            photo.fileName &&
          pending.mimeType ===
            photo.mimeType &&
          pending.sizeBytes ===
            photo.sizeBytes,
      )
    })

  if (!arePhotosPending) {
    throw new RequestFlowError({
      code: "invalid_request_photos",
      message:
        "One or more request photos cannot be attached.",
      statusCode: 400,
    })
  }

  const attached =
    await tx.requestPhoto.updateMany({
      where: {
        uploadId: {
          in: uploadIds,
        },
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
      message:
        "One or more request photos cannot be attached.",
      statusCode: 400,
    })
  }
}

export async function createRequestFromDraft({
  draft,
}: CreateRequestFromDraftInput): Promise<CreateRequestFromDraftResult> {
  const preparedPhotos =
    validateRequestPhotosForCreation(
      draft,
    )

  const persistedDraft =
    preparedPhotos.draft

  const customer =
    validateDraftForCreation(
      persistedDraft,
    )

  const geo =
    validateGeoForCreation(
      persistedDraft,
    )

  const requiredServiceIds =
    await resolveRequiredServiceIds(
      persistedDraft.matchingSignals
        .requiredServiceSlugs,
    )

  const verification =
    createRequestVerificationToken()

  const data: Omit<
    Prisma.RequestCreateInput,
    "customer"
  > = {
    status: "PENDING_VERIFICATION",
    requestCode:
      await generateUniqueRequestCode(),
    interventionSlug:
      persistedDraft.interventionSlug,
    customerEmail:
      customer.customerEmail,
    structuredData:
      toRequestStructuredData({
        draft: persistedDraft,
      }),
    requiredServices: {
      create:
        requiredServiceIds.map(
          (serviceId) => ({
            service: {
              connect: {
                id: serviceId,
              },
            },
          }),
        ),
    },
  }

  if (customer.customerName) {
    data.customerName =
      customer.customerName
  }

  if (customer.customerPhone) {
    data.customerPhone =
      customer.customerPhone
  }

  data.city = geo.city

  data.address = geo.address

  if (geo.postalCode) {
    data.postalCode =
      geo.postalCode
  }

  data.latitude =
    geo.latitude

  data.longitude =
    geo.longitude

  const request =
    await prisma.$transaction(
      async (tx) => {
        const persistedCustomer =
          await tx.customer.upsert({
            where: {
              email:
                customer.customerEmail,
            },
            create: {
              email:
                customer.customerEmail,
              ...(customer.customerName
                ? {
                    name:
                      customer.customerName,
                  }
                : {}),
              ...(customer.customerPhone
                ? {
                    phone:
                      customer.customerPhone,
                  }
                : {}),
            },
            update: {
              ...(customer.customerName
                ? {
                    name:
                      customer.customerName,
                  }
                : {}),
              ...(customer.customerPhone
                ? {
                    phone:
                      customer.customerPhone,
                  }
                : {}),
            },
            select: {
              id: true,
            },
          })

        const createdRequest =
          await tx.request.create({
            data: {
              ...data,
              customer: {
                connect: {
                  id:
                    persistedCustomer.id,
                },
              },
            },
            select: {
              id: true,
              status: true,
            },
          })

        await attachRequestPhotos({
          tx,
          requestId:
            createdRequest.id,
          photos:
            preparedPhotos.photos,
        })

        await createRequestVerificationAccessToken({
          tx,
          email:
            customer.customerEmail,
          requestId:
            createdRequest.id,
          tokenHash:
            verification.tokenHash,
          expiresAt:
            verification.expiresAt,
        })

        return createdRequest
      },
    )

  const verificationUrl =
    buildRequestVerificationUrl({
      requestId: request.id,
      token: verification.token,
    })

  const emailResult =
    await sendRequestVerificationEmail({
      to: customer.customerEmail,
      verificationUrl,
    })

  return {
    requestId: request.id,
    status: "PENDING_VERIFICATION",
    verificationEmailSent:
      emailResult.sent,
    verificationEmailProvider:
      emailResult.provider,
  }
}
