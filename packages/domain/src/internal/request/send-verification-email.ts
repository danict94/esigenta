import { requestVerificationEmail, sendEmail } from "@esigenta/notifications"

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
  const email = requestVerificationEmail({ verificationUrl })
  await sendEmail({ to, ...email })
  return {
    sent: true,
    provider: "resend",
    verificationUrl,
  }
}
