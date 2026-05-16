import {
  Resend,
} from "resend"

let resendClient:
  | Resend
  | null = null

export function getResendClient(): Resend {
  const apiKey =
    process.env.RESEND_API_KEY

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is required to send email.",
    )
  }

  resendClient ??=
    new Resend(apiKey)

  return resendClient
}

export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL ??
    "FixPro <onboarding@resend.dev>"
  )
}
