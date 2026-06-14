import {
  getResendClient,
  getResendFromEmail,
} from "./resend-client"

export type SendEmailInput = {
  to: string
  subject: string
  html: string
  text: string
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailInput) {
  const resend = getResendClient()

  const result = await resend.emails.send({
    from: getResendFromEmail(),
    to,
    subject,
    html,
    text,
  })

  if (result.error) {
    throw new Error(
      result.error.message || "Unable to send email with Resend.",
    )
  }

  return result.data
}
