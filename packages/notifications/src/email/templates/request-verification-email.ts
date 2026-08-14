import { EMAIL_ROOT_STYLE } from "../template-styles"

export type RequestVerificationEmailInput = {
  verificationUrl: string
}

export function requestVerificationEmail({
  verificationUrl,
}: RequestVerificationEmailInput) {
  const subject = "Verifica la tua richiesta Esigenta"

  const text = [
    "Ciao,",
    "",
    "conferma la tua richiesta Esigenta per inviarla ai professionisti giusti.",
    "",
    `Verifica la richiesta: ${verificationUrl}`,
    "",
    "Se non hai creato tu questa richiesta, puoi ignorare questa email.",
  ].join("\n")

  const html = `
    <div style="${EMAIL_ROOT_STYLE}">
      <p>Ciao,</p>
      <p>conferma la tua richiesta Esigenta per inviarla ai professionisti giusti.</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
          Verifica la richiesta
        </a>
      </p>
      <p>Se non hai creato tu questa richiesta, puoi ignorare questa email.</p>
    </div>
  `

  return { subject, html, text }
}
