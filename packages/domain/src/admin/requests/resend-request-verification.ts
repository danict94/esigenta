import { prisma } from "@esigenta/database"

import { RequestFlowError } from "../../internal/request/request-errors"
import { createRequestVerificationToken } from "../../internal/request/verification-token"
import { createRequestVerificationAccessToken } from "../../internal/request/customer-access-token"
import { buildRequestVerificationUrl } from "../../internal/request/request-links"
import { sendRequestVerificationEmail } from "../../internal/request/send-verification-email"

export type ResendRequestVerificationEmailInput = {
  requestId: string
}

export type ResendRequestVerificationEmailResult = {
  requestId: string
  sent: boolean
}

type ResendableRequest = {
  id: string
  status: string
  verifiedAt: Date | null
  customerEmail: string | null
}

/**
 * Re-sends the exact same verification email the funnel sends at request
 * creation (requestVerificationEmail via sendRequestVerificationEmail) —
 * no duplicate email template, no duplicate sending path. Issues a fresh
 * CustomerAccessToken rather than reusing/extending an expired one, mirroring
 * how create-request.ts issues the original token. See
 * docs/pre-release/PENDING_VERIFICATION_RECOVERY_IMPLEMENTATION.md.
 */
export async function resendRequestVerificationEmail({
  requestId,
}: ResendRequestVerificationEmailInput): Promise<ResendRequestVerificationEmailResult> {
  const verification = createRequestVerificationToken()

  const request = await prisma.$transaction(async (tx) => {
    const found = (await tx.request.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        status: true,
        verifiedAt: true,
        customerEmail: true,
      },
    })) as ResendableRequest | null

    if (!found) {
      throw new RequestFlowError({
        code: "request_not_found",
        message: "Request could not be found.",
        statusCode: 404,
      })
    }

    if (found.status !== "PENDING_VERIFICATION" || found.verifiedAt) {
      throw new RequestFlowError({
        code: "request_already_verified",
        message: "La richiesta è già stata verificata.",
        statusCode: 400,
      })
    }

    if (!found.customerEmail) {
      throw new RequestFlowError({
        code: "missing_customer_email",
        message: "La richiesta non ha un'email cliente associata.",
        statusCode: 400,
      })
    }

    await createRequestVerificationAccessToken({
      tx,
      email: found.customerEmail,
      requestId: found.id,
      tokenHash: verification.tokenHash,
      expiresAt: verification.expiresAt,
    })

    return found
  })

  const verificationUrl = buildRequestVerificationUrl({
    token: verification.token,
  })

  const emailResult = await sendRequestVerificationEmail({
    to: request.customerEmail as string,
    verificationUrl,
  })

  return {
    requestId: request.id,
    sent: emailResult.sent,
  }
}
