import { EMAIL_ROOT_STYLE } from "../template-styles"

export type CustomerRequestsAccessEmailInput = {
  accessUrl: string
}

export function customerRequestsAccessEmail({
  accessUrl,
}: CustomerRequestsAccessEmailInput) {
  const subject =
    "Accedi alle tue richieste Esigenta"

  const text = [
    "Ciao,",
    "",
    "usa questo link per vedere le tue richieste Esigenta.",
    "",
    `Apri le tue richieste: ${accessUrl}`,
    "",
    "Se non hai richiesto tu questo link, puoi ignorare questa email.",
  ].join("\n")

  const html = `
    <div style="${EMAIL_ROOT_STYLE}">
      <p>Ciao,</p>
      <p>usa questo link per vedere le tue richieste Esigenta.</p>
      <p>
        <a href="${accessUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
          Apri le mie richieste
        </a>
      </p>
      <p>Se non hai richiesto tu questo link, puoi ignorare questa email.</p>
    </div>
  `

  return {
    subject,
    html,
    text,
  }
}
