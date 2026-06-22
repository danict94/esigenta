import type {
  Prisma,
  RequestStatus,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

import {
  customerRequestsAccessEmail,
  sendEmail,
} from "@esigenta/notifications"

import {
  createRequestStatusAccessToken,
  findValidRequestStatusAccessToken,
} from "../../internal/request/customer-access-token"

import {
  RequestFlowError,
} from "../../internal/request/request-errors"

import {
  buildCustomerRequestsUrl,
} from "../../internal/request/request-links"

import {
  hashVerificationToken,
} from "../../internal/request/verification-token"

type CustomerHistoryAccessToken = {
  id: string
  email: string
  expiresAt: Date
}

type CustomerHistoryAccessTokenIssue = {
  email: string
  token: string
  expiresAt: Date
}

type CustomerRequestSummary = {
  requestId: string
  requestCode: string | null
  status: RequestStatus
  interventionSlug: string | null
  city: string | null
  createdAt: Date
}

export type CustomerRequestStatus =
  CustomerRequestSummary & {
    verifiedAt: Date | null
    historyAccessToken: string | null
  }

export type CustomerRequestListItem = CustomerRequestSummary

export type CustomerRequestDetail = CustomerRequestSummary & {
  structuredData: Prisma.JsonValue | null
}

function normalizeEmail(
  value: string,
): string | null {
  const email =
    value.trim().toLowerCase()

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email,
  )
    ? email
    : null
}

function createHistoryAccessExpiresAt(): Date {
  return new Date(
    Date.now() + 1000 * 60 * 60,
  )
}

async function requireValidStatusAccessToken(
  token: string,
) {
  const trimmedToken =
    token.trim()

  if (!trimmedToken) {
    throw new RequestFlowError({
      code: "invalid_status_access_token",
      message:
        "Il link non e valido o e scaduto.",
      statusCode: 400,
    })
  }

  const accessToken =
    await findValidRequestStatusAccessToken({
      tokenHash:
        hashVerificationToken(
          trimmedToken,
        ),
      now: new Date(),
    })

  if (!accessToken) {
    throw new RequestFlowError({
      code: "invalid_status_access_token",
      message:
        "Il link non e valido o e scaduto.",
      statusCode: 400,
    })
  }

  return accessToken
}

async function requireCustomerForHistoryToken(
  token: string,
) {
  const accessToken =
    await validateCustomerHistoryToken(
      token,
    )

  const customer =
    await prisma.customer.findUnique({
      where: {
        email: accessToken.email,
      },
      select: {
        id: true,
        email: true,
      },
    })

  if (!customer) {
    throw new RequestFlowError({
      code: "customer_not_found",
      message:
        "Non abbiamo trovato richieste per questo link.",
      statusCode: 404,
    })
  }

  await linkLegacyRequestsToCustomer(
    customer,
  )

  return customer
}

async function linkLegacyRequestsToCustomer(customer: {
  id: string
  email: string
}) {
  await prisma.request.updateMany({
    where: {
      customerId: null,
      customerEmail: customer.email,
    },
    data: {
      customerId: customer.id,
    },
  })
}

export async function getRequestStatusByToken({
  token,
}: {
  token: string
}): Promise<CustomerRequestStatus> {
  const accessToken =
    await requireValidStatusAccessToken(
      token,
    )

  if (!accessToken.requestId) {
    throw new RequestFlowError({
      code: "invalid_status_access_token",
      message:
        "Questo link non e valido per una singola richiesta.",
      statusCode: 400,
    })
  }

  const request =
    await prisma.request.findUnique({
      where: {
        id: accessToken.requestId,
      },
      select: {
        id: true,
        requestCode: true,
        status: true,
        interventionSlug: true,
        geoLocation: {
          select: { city: true },
        },
        createdAt: true,
        verifiedAt: true,
        customerEmail: true,
        customer: {
          select: {
            email: true,
          },
        },
      },
    })

  if (
    !request ||
    (request.customerEmail !==
      accessToken.email &&
      request.customer?.email !==
        accessToken.email)
  ) {
    throw new RequestFlowError({
      code: "request_not_found",
      message:
        "Richiesta non trovata per questo link.",
      statusCode: 404,
    })
  }

  const historyAccessToken =
    await createCustomerHistoryAccessToken(
      accessToken.email,
    )

  return {
    requestId: request.id,
    requestCode:
      request.requestCode,
    status: request.status,
    interventionSlug:
      request.interventionSlug,
    city: request.geoLocation?.city ?? null,
    createdAt: request.createdAt,
    verifiedAt: request.verifiedAt,
    historyAccessToken:
      historyAccessToken?.token ?? null,
  }
}

export async function createCustomerHistoryAccessToken(
  email: string,
): Promise<CustomerHistoryAccessTokenIssue | null> {
  const normalizedEmail =
    normalizeEmail(email)

  if (!normalizedEmail) {
    return null
  }

  const customer =
    await prisma.customer.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        email: true,
      },
    })

  if (!customer) {
    return null
  }

  const accessToken =
    await createRequestStatusAccessToken({
      email: customer.email,
      requestId: null,
      expiresAt:
        createHistoryAccessExpiresAt(),
    })

  return {
    email: customer.email,
    token: accessToken.token,
    expiresAt:
      accessToken.expiresAt,
  }
}

export async function validateCustomerHistoryToken(
  token: string,
): Promise<CustomerHistoryAccessToken> {
  const accessToken =
    await requireValidStatusAccessToken(
      token,
    )

  if (accessToken.requestId !== null) {
    throw new RequestFlowError({
      code: "invalid_customer_requests_token",
      message:
        "Questo link non e valido per lo storico richieste.",
      statusCode: 400,
    })
  }

  return {
    id: accessToken.id,
    email: accessToken.email,
    expiresAt:
      accessToken.expiresAt,
  }
}

export async function sendCustomerRequestsAccessEmail({
  email,
}: {
  email: string
}): Promise<void> {
  const accessToken =
    await createCustomerHistoryAccessToken(
      email,
    )

  if (!accessToken) {
    return
  }

  const accessUrl =
    buildCustomerRequestsUrl({
      token: accessToken.token,
    })

  const emailContent =
    customerRequestsAccessEmail({
      accessUrl,
    })

  await sendEmail({
    to: accessToken.email,
    ...emailContent,
  })
}

export async function getCustomerRequestsByHistoryToken(
  token: string,
): Promise<CustomerRequestListItem[]> {
  const customer =
    await requireCustomerForHistoryToken(
      token,
    )

  const requests =
    await prisma.request.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        requestCode: true,
        status: true,
        interventionSlug: true,
        geoLocation: {
          select: { city: true },
        },
        createdAt: true,
      },
    })

  return requests.map((request) => ({
    requestId: request.id,
    requestCode: request.requestCode,
    status: request.status,
    interventionSlug:
      request.interventionSlug,
    city: request.geoLocation?.city ?? null,
    createdAt: request.createdAt,
  }))
}

export async function getCustomerRequestByHistoryToken({
  token,
  requestId,
}: {
  token: string
  requestId: string
}): Promise<CustomerRequestDetail> {
  const customer =
    await requireCustomerForHistoryToken(
      token,
    )

  const request =
    await prisma.request.findFirst({
      where: {
        id: requestId,
        customerId: customer.id,
      },
      select: {
        id: true,
        requestCode: true,
        status: true,
        interventionSlug: true,
        geoLocation: {
          select: { city: true },
        },
        createdAt: true,
        structuredData: true,
      },
    })

  if (!request) {
    throw new RequestFlowError({
      code: "request_not_found",
      message:
        "Richiesta non trovata per questo link.",
      statusCode: 404,
    })
  }

  return {
    requestId: request.id,
    requestCode: request.requestCode,
    status: request.status,
    interventionSlug:
      request.interventionSlug,
    city: request.geoLocation?.city ?? null,
    createdAt: request.createdAt,
    structuredData:
      request.structuredData,
  }
}

export async function listCustomerRequestsByToken({
  token,
}: {
  token: string
}): Promise<CustomerRequestListItem[]> {
  return getCustomerRequestsByHistoryToken(
    token,
  )
}
