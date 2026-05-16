/**
 * FixPro V2 - Request Creation Flow
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

import { prisma } from "../prisma/client"

import type {
  RequestDraft,
} from "../funnel/types/request-draft"

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

function normalizeText(
  value: string | undefined,
): string | undefined {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : undefined
}

function buildCustomerName({
  firstName,
  lastName,
  name,
}: {
  firstName: string | undefined
  lastName: string | undefined
  name: string | undefined
}): string | undefined {
  const hasStructuredName =
    Boolean(firstName || lastName)

  if (hasStructuredName) {
    return [firstName, lastName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(" ")
  }

  return name
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
    normalizeText(
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
    normalizeText(
      draft.contact.firstName,
    )

  const customerLastName =
    normalizeText(
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
    normalizeText(
      buildCustomerName({
        firstName:
          customerFirstName,
        lastName:
          customerLastName,
        name:
          normalizeText(
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
    normalizeText(draft.contact.phone)

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
    normalizeText(draft.geo.address)

  const city =
    normalizeText(draft.geo.city)

  const postalCode =
    normalizeText(draft.geo.postalCode)

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

export async function createRequestFromDraft({
  draft,
}: CreateRequestFromDraftInput): Promise<CreateRequestFromDraftResult> {
  const customer =
    validateDraftForCreation(draft)

  const geo =
    validateGeoForCreation(draft)

  const requiredServiceIds =
    await resolveRequiredServiceIds(
      draft.matchingSignals
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
      draft.interventionSlug,
    customerEmail:
      customer.customerEmail,
    structuredData:
      toRequestStructuredData({
        draft,
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
