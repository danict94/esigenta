import { escapeHtml } from "../html-escape"

export type NewCompanyAdminEmailInput = {
  companyId: string
  companyName: string
  userEmail: string | null
  createdAt: Date
  adminUrl: string | null
}

export function newCompanyAdminEmail({
  companyId,
  companyName,
  userEmail,
  createdAt,
  adminUrl,
}: NewCompanyAdminEmailInput) {
  const subject = "Nuova impresa da verificare su Esigenta"

  const createdAtLine = new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(createdAt)

  const details = [
    `Impresa: ${companyName} (${companyId})`,
    `Email utente: ${userEmail ?? "-"}`,
    `Stato: PENDING_REVIEW`,
    `Registrata il: ${createdAtLine}`,
  ]

  const text = [
    "Una nuova impresa si e' registrata ed e' in attesa di verifica.",
    "",
    ...details,
    "",
    adminUrl
      ? `Apri il pannello admin: ${adminUrl}`
      : "Apri il pannello admin e verifica le imprese in attesa.",
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Una nuova impresa si &egrave; registrata ed &egrave; in attesa di verifica.</p>
      <ul>
        ${details.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
      </ul>
      ${
        adminUrl
          ? `<p><a href="${escapeHtml(adminUrl)}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">Apri il pannello admin</a></p>`
          : `<p>Apri il pannello admin e verifica le imprese in attesa.</p>`
      }
    </div>
  `

  return { subject, html, text }
}
