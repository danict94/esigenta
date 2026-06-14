import { getResendClient, getResendFromEmail } from "@esigenta/notifications"

export type SendRequestEmailWithResendInput = {
  to: string
  subject: string
  text: string
  html: string
  idempotencyKey: string
}

export type SendRequestEmailWithResendResult = {
  provider: "resend"
  providerMessageId: string | null
}

export async function sendRequestEmailWithResend({
  to,
  subject,
  text,
  html,
  idempotencyKey,
}: SendRequestEmailWithResendInput): Promise<SendRequestEmailWithResendResult> {
  const result = await getResendClient().emails.send(
    {
      from: getResendFromEmail(),
      to,
      subject,
      text,
      html,
    },
    {
      idempotencyKey,
    },
  )

  if (result.error) {
    throw new Error(
      result.error.message ||
        "Unable to send request notification email with Resend.",
    )
  }

  return {
    provider: "resend",
    providerMessageId: result.data?.id ?? null,
  }
}
