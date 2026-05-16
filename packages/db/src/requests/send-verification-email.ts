/**
 * FixPro V2 - Request Verification Email
 *
 * Sends request verification email through the shared email layer.
 */

import {
  requestVerificationEmail,
  sendEmail,
} from "../email"

export type SendRequestVerificationEmailInput = {
  to: string
  verificationUrl: string
}

export type SendRequestVerificationEmailResult = {
  sent: boolean
  provider: "resend"
  verificationUrl: string
}

export async function sendRequestVerificationEmail({
  to,
  verificationUrl,
}: SendRequestVerificationEmailInput): Promise<SendRequestVerificationEmailResult> {
  const email =
    requestVerificationEmail({
      verificationUrl,
    })

  await sendEmail({
    to,
    ...email,
  })

  return {
    sent: true,
    provider: "resend",
    verificationUrl,
  }
}
