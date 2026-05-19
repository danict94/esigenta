import {
  Resend,
} from "resend"

let resendClient: Resend | null = null

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

function getRequiredEnv(
  name: string,
) {
  const value =
    process.env[name]?.trim()

  if (!value) {
    throw new Error(
      `${name} is required to send request email notifications.`,
    )
  }

  return value
}

function getResendClient() {
  resendClient ??= new Resend(
    getRequiredEnv("RESEND_API_KEY"),
  )

  return resendClient
}

function getResendFromEmail() {
  return getRequiredEnv(
    "RESEND_FROM_EMAIL",
  )
}

export async function sendRequestEmailWithResend({
  to,
  subject,
  text,
  html,
  idempotencyKey,
}: SendRequestEmailWithResendInput): Promise<SendRequestEmailWithResendResult> {
  const result =
    await getResendClient().emails.send(
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
    providerMessageId:
      result.data?.id ?? null,
  }
}
