import { escapeHtml } from "../html-escape"

export type NewRequestAdminEmailInput = {
  requestId: string
  requestCode: string | null
  interventionSlug: string | null
  city: string | null
  verifiedAt: Date | null
  adminUrl: string | null
}

function formatVerifiedAt(verifiedAt: Date | null): string {
  if (!verifiedAt) {
    return "-"
  }

  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(verifiedAt)
}

export function newRequestAdminEmail({
  requestId,
  requestCode,
  interventionSlug,
  city,
  verifiedAt,
  adminUrl,
}: NewRequestAdminEmailInput) {
  const subject = "Nuova richiesta da approvare su Esigenta"

  const label = requestCode ?? requestId
  const interventionLine = interventionSlug ?? "-"
  const cityLine = city ?? "-"
  const verifiedAtLine = formatVerifiedAt(verifiedAt)

  const details = [
    `Richiesta: ${label}`,
    `Intervento: ${interventionLine}`,
    `Città: ${cityLine}`,
    `Stato: PENDING_REVIEW`,
    `Verificata il: ${verifiedAtLine}`,
  ]

  const text = [
    "Una nuova richiesta e' pronta per la revisione.",
    "",
    ...details,
    "",
    adminUrl
      ? `Apri la richiesta: ${adminUrl}`
      : "Apri il pannello admin per revisionarla.",
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Una nuova richiesta &egrave; pronta per la revisione.</p>
      <ul>
        ${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
      ${
        adminUrl
          ? `<p><a href="${escapeHtml(adminUrl)}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">Apri la richiesta</a></p>`
          : `<p>Apri il pannello admin per revisionarla.</p>`
      }
    </div>
  `

  return { subject, html, text }
}
