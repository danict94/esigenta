import type {
  Prisma,
} from "@prisma/client"

import { prisma } from "@esigenta/database"

import {
  RequestFlowError,
} from "../../internal/request/request-errors"

import {
  readRequestStructuredData,
} from "../../internal/request/request-structured-data"

import {
  hashVerificationToken,
  verifyTokenHash,
} from "../../internal/request/verification-token"

import {
  createRequestStatusAccessToken,
  consumeRequestVerificationAccessToken,
  findValidRequestVerificationAccessToken,
} from "../../internal/request/customer-access-token"

import {
  notifyAdminsOfRequestPendingReview,
} from "../../internal/request/notify-admins-request-pending-review"

export type VerifyRequestEmailInput = {
  requestId: string
  token: string
}

export type VerifyRequestEmailResult = {
  requestId: string
  status:
    | "PENDING_REVIEW"
    | "ALREADY_VERIFIED"
  statusAccessToken?: string
  historyAccessToken?: string
}

type RequestForVerification = {
  id: string
  status: string
  verifiedAt: Date | null
  customerEmail: string | null
  customerId: string | null
  structuredData: Prisma.JsonValue | null
}

function createStatusTokenExpiresAt(): Date {
  return new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 30,
  )
}

function createHistoryTokenExpiresAt(): Date {
  return new Date(
    Date.now() + 1000 * 60 * 60,
  )
}

/**
 * FASE 7 FINAL (§B) — pure decision boundary for the race branch inside
 * verifyWithAccessToken: given the Request's CURRENT state (re-read right
 * after losing the atomic token-consume race), is this "already verified
 * by a concurrent request" or "genuinely nothing to show for this token"?
 * Exported so this specific boundary is unit-testable without a live
 * database — the surrounding orchestration (the transaction itself, the
 * atomic consume, the exactly-once admin notification) is not, consistent
 * with this package's existing convention of never touching Prisma in
 * tests (see verify-request.test.ts).
 */
export function isRequestAlreadyVerified(
  current: { verifiedAt: Date | null; status: string } | null,
): boolean {
  return Boolean(
    current && (current.verifiedAt || current.status !== "PENDING_VERIFICATION"),
  )
}

/**
 * Single transition point for PENDING_VERIFICATION -> PENDING_REVIEW.
 * Shared by the customer's own email-link verification
 * (verifyWithAccessToken) and the admin "verify manually" recovery action
 * (verifyRequestManually below) so the two paths can never diverge in what
 * "verified" actually means for a request — no parallel publication
 * lifecycle. Must run inside the caller's own transaction so it stays
 * atomic with token consumption when a token is involved.
 */
async function advanceVerifiedRequestToReviewInTransaction({
  tx,
  request,
  tokenEmail,
  verifiedAt,
}: {
  tx: Prisma.TransactionClient
  request: RequestForVerification
  tokenEmail: string
  verifiedAt: Date
}): Promise<{
  statusAccessToken: string
  historyAccessToken: string
}> {
  await tx.request.update({
    where: {
      id: request.id,
    },
    data: {
      status: "PENDING_REVIEW",
      verifiedAt,
    },
  })

  await tx.customer.updateMany({
    where: request.customerId
      ? {
          id: request.customerId,
          verifiedAt: null,
        }
      : {
          email: tokenEmail,
          verifiedAt: null,
        },
    data: {
      verifiedAt,
    },
  })

  const statusToken =
    await createRequestStatusAccessToken({
      client: tx,
      email: tokenEmail,
      requestId: request.id,
      expiresAt:
        createStatusTokenExpiresAt(),
    })

  const historyToken =
    await createRequestStatusAccessToken({
      client: tx,
      email: tokenEmail,
      requestId: null,
      expiresAt:
        createHistoryTokenExpiresAt(),
    })

  return {
    statusAccessToken: statusToken.token,
    historyAccessToken: historyToken.token,
  }
}

/**
 * FASE 7 FINAL (§B): the two outcomes possible once inside the
 * transaction — a real win (token consumed, Request advanced) or a
 * legitimate loss to a concurrent verification of the SAME Request
 * (see the count !== 1 branch below). Kept as a discriminated result
 * returned FROM the transaction, rather than throwing on the second
 * case, precisely so the caller can tell the two apart afterward.
 */
type VerifyWithAccessTokenTxResult =
  | {
      outcome: "verified"
      statusAccessToken: string
      historyAccessToken: string
    }
  | { outcome: "already_verified" }

async function verifyWithAccessToken({
  request,
  tokenId,
  tokenRequestId,
  tokenEmail,
  verifiedAt,
}: {
  request: RequestForVerification
  tokenId: string
  tokenRequestId: string | null
  tokenEmail: string
  verifiedAt: Date
}): Promise<VerifyRequestEmailResult> {
  if (tokenRequestId !== request.id) {
    throw new RequestFlowError({
      code: "invalid_verification_token",
      message:
        "Request verification link is not valid.",
      statusCode: 400,
    })
  }

  const txResult = await prisma.$transaction(
    async (tx): Promise<VerifyWithAccessTokenTxResult> => {
      const consumed =
        await consumeRequestVerificationAccessToken({
          tx,
          tokenId,
          usedAt: verifiedAt,
        })

      if (consumed.count !== 1) {
        // FASE 7 FINAL (§B) — the atomic consume above is unchanged and
        // still race-safe (see customer-access-token.ts): this branch
        // only decides what to TELL the customer about a token that
        // lost the race, never re-opens who wins it. Two distinct
        // reasons can land here, and only one of them is a real error:
        // (1) the token was already consumed by a concurrent
        // verification of THIS SAME Request (double click, two tabs,
        // two devices) — the Request is now verified, and the customer
        // should see that, not "invalid link"; (2) the token is
        // genuinely invalid/expired/reused on a Request that is still
        // unverified — a real error, unchanged from before this fix.
        const current = await tx.request.findUnique({
          where: { id: request.id },
          select: { verifiedAt: true, status: true },
        })

        if (isRequestAlreadyVerified(current)) {
          return { outcome: "already_verified" }
        }

        throw new RequestFlowError({
          code: "invalid_verification_token",
          message:
            "Request verification link is not valid.",
          statusCode: 400,
        })
      }

      const tokens = await advanceVerifiedRequestToReviewInTransaction({
        tx,
        request,
        tokenEmail,
        verifiedAt,
      })

      return { outcome: "verified", ...tokens }
    },
  )

  if (txResult.outcome === "already_verified") {
    // No admin notification here — only the transaction that actually
    // performed advanceVerifiedRequestToReviewInTransaction (the real
    // winner, possibly a different request entirely, e.g. a concurrent
    // request in another tab) triggers it, exactly once — unchanged.
    return {
      requestId: request.id,
      status: "ALREADY_VERIFIED",
    }
  }

  await notifyAdminsOfRequestPendingReview(request.id)

  return {
    requestId: request.id,
    status: "PENDING_REVIEW",
    statusAccessToken: txResult.statusAccessToken,
    historyAccessToken: txResult.historyAccessToken,
  }
}

async function verifyWithLegacyStructuredDataToken({
  request,
  token,
  verifiedAt,
}: {
  request: RequestForVerification
  token: string
  verifiedAt: Date
}): Promise<VerifyRequestEmailResult> {
  const structuredData =
    readRequestStructuredData(
      request.structuredData,
    )

  const verification =
    structuredData.verification

  if (!verification?.tokenHash) {
    throw new RequestFlowError({
      code: "missing_verification_token",
      message:
        "Request verification token is no longer available.",
      statusCode: 400,
    })
  }

  if (
    new Date(verification.expiresAt) <
    verifiedAt
  ) {
    throw new RequestFlowError({
      code: "verification_token_expired",
      message:
        "Request verification link has expired.",
      statusCode: 400,
    })
  }

  if (
    !verifyTokenHash({
      token,
      tokenHash:
        verification.tokenHash,
    })
  ) {
    throw new RequestFlowError({
      code: "invalid_verification_token",
      message:
        "Request verification link is not valid.",
      statusCode: 400,
    })
  }

  const nextStructuredData: Prisma.InputJsonObject = {
    ...structuredData,
    verification: {
      ...verification,
      tokenHash: null,
      verifiedAt:
        verifiedAt.toISOString(),
      usedAt:
        verifiedAt.toISOString(),
    },
  }

  let statusAccessToken:
    | string
    | undefined
  let historyAccessToken:
    | string
    | undefined

  await prisma.$transaction(
    async (tx) => {
      await tx.request.update({
        where: {
          id: request.id,
        },
        data: {
          status: "PENDING_REVIEW",
          verifiedAt,
          structuredData:
            nextStructuredData,
        },
      })

      if (
        request.customerId ||
        request.customerEmail
      ) {
        await tx.customer.updateMany({
          where: request.customerId
            ? {
                id: request.customerId,
                verifiedAt: null,
              }
            : {
                email:
                  request.customerEmail ?? "",
                verifiedAt: null,
              },
          data: {
            verifiedAt,
          },
        })
      }

      if (request.customerEmail) {
        const statusToken =
          await createRequestStatusAccessToken({
            client: tx,
            email:
              request.customerEmail,
            requestId: request.id,
            expiresAt:
              createStatusTokenExpiresAt(),
          })

        statusAccessToken =
          statusToken.token

        const historyToken =
          await createRequestStatusAccessToken({
            client: tx,
            email:
              request.customerEmail,
            requestId: null,
            expiresAt:
              createHistoryTokenExpiresAt(),
          })

        historyAccessToken =
          historyToken.token
      }
    },
  )

  await notifyAdminsOfRequestPendingReview(request.id)

  return {
    requestId: request.id,
    status: "PENDING_REVIEW",
    ...(statusAccessToken
      ? {
          statusAccessToken,
        }
      : {}),
    ...(historyAccessToken
      ? {
          historyAccessToken,
        }
      : {}),
  }
}

export type VerifyRequestEmailByTokenInput = {
  token: string
}

/**
 * Single-token verification entrypoint (D-014): looks up the request purely
 * from the token (CustomerAccessToken.requestId), no requestId needed in the
 * URL. Only supports tokens issued via createRequestVerificationAccessToken
 * (every request created since this mechanism shipped — see
 * public/requests/create-request.ts). Legacy requests whose verification
 * token lives only in Request.structuredData (pre-dating that table) are not
 * reachable here and keep using the requestId+token query-param route via
 * verifyRequestEmail, which remains unchanged for backward compatibility
 * with already-emitted links.
 */
export async function verifyRequestEmailByToken({
  token,
}: VerifyRequestEmailByTokenInput): Promise<VerifyRequestEmailResult> {
  const verifiedAt = new Date()

  const accessToken = await findValidRequestVerificationAccessToken({
    tokenHash: hashVerificationToken(token),
    now: verifiedAt,
  })

  if (!accessToken || !accessToken.requestId) {
    throw new RequestFlowError({
      code: "invalid_verification_token",
      message: "Request verification link is not valid.",
      statusCode: 400,
    })
  }

  const request = await prisma.request.findUnique({
    where: { id: accessToken.requestId },
    select: {
      id: true,
      status: true,
      verifiedAt: true,
      customerEmail: true,
      customerId: true,
      structuredData: true,
    },
  })

  if (!request) {
    throw new RequestFlowError({
      code: "request_not_found",
      message: "Request could not be found.",
      statusCode: 404,
    })
  }

  if (request.verifiedAt || request.status !== "PENDING_VERIFICATION") {
    return { requestId: request.id, status: "ALREADY_VERIFIED" }
  }

  return verifyWithAccessToken({
    request,
    tokenId: accessToken.id,
    tokenRequestId: accessToken.requestId,
    tokenEmail: accessToken.email,
    verifiedAt,
  })
}

export async function verifyRequestEmail({
  requestId,
  token,
}: VerifyRequestEmailInput): Promise<VerifyRequestEmailResult> {
  const request =
    await prisma.request.findUnique({
      where: {
        id: requestId,
      },
      select: {
        id: true,
        status: true,
        verifiedAt: true,
        customerEmail: true,
        customerId: true,
        structuredData: true,
      },
    })

  if (!request) {
    throw new RequestFlowError({
      code: "request_not_found",
      message:
        "Request could not be found.",
      statusCode: 404,
    })
  }

  if (
    request.verifiedAt ||
    request.status !==
      "PENDING_VERIFICATION"
  ) {
    return {
      requestId: request.id,
      status: "ALREADY_VERIFIED",
    }
  }

  const verifiedAt =
    new Date()

  const accessToken =
    await findValidRequestVerificationAccessToken({
      tokenHash:
        hashVerificationToken(token),
      now: verifiedAt,
    })

  if (accessToken) {
    return verifyWithAccessToken({
      request,
      tokenId:
        accessToken.id,
      tokenRequestId:
        accessToken.requestId,
      tokenEmail:
        accessToken.email,
      verifiedAt,
    })
  }

  return verifyWithLegacyStructuredDataToken({
    request,
    token,
    verifiedAt,
  })
}

export type VerifyRequestManuallyInput = {
  requestId: string
}

/**
 * Admin recovery path for PENDING_VERIFICATION RECOVERY (P0): lets an admin
 * push a request into the normal moderation workflow when the customer
 * never received/clicked their verification email. Does NOT bypass
 * moderation or create a second publish path — it only performs the exact
 * same PENDING_VERIFICATION -> PENDING_REVIEW transition the customer's own
 * email link performs (advanceVerifiedRequestToReviewInTransaction above),
 * minus the token-consumption step, since there is no customer token
 * involved here. publishReviewedRequest/reviewRequest remain the only way
 * to move a request past PENDING_REVIEW. See
 * docs/pre-release/PENDING_VERIFICATION_RECOVERY_IMPLEMENTATION.md.
 */
export async function verifyRequestManually({
  requestId,
}: VerifyRequestManuallyInput): Promise<VerifyRequestEmailResult> {
  const verifiedAt = new Date()

  const request = await prisma.request.findUnique({
    where: {
      id: requestId,
    },
    select: {
      id: true,
      status: true,
      verifiedAt: true,
      customerEmail: true,
      customerId: true,
      structuredData: true,
    },
  })

  if (!request) {
    throw new RequestFlowError({
      code: "request_not_found",
      message: "Request could not be found.",
      statusCode: 404,
    })
  }

  if (
    request.verifiedAt ||
    request.status !== "PENDING_VERIFICATION"
  ) {
    return {
      requestId: request.id,
      status: "ALREADY_VERIFIED",
    }
  }

  if (!request.customerEmail) {
    throw new RequestFlowError({
      code: "missing_customer_email",
      message: "Request has no customer email to verify.",
      statusCode: 400,
    })
  }

  const tokens = await prisma.$transaction((tx) =>
    advanceVerifiedRequestToReviewInTransaction({
      tx,
      request,
      tokenEmail: request.customerEmail as string,
      verifiedAt,
    }),
  )

  await notifyAdminsOfRequestPendingReview(request.id)

  return {
    requestId: request.id,
    status: "PENDING_REVIEW",
    statusAccessToken: tokens.statusAccessToken,
    historyAccessToken: tokens.historyAccessToken,
  }
}
