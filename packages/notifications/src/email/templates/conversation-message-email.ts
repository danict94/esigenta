export type ConversationMessageEmailInput = {
  accessUrl: string
  recipientLabel?: string | null | undefined
  senderLabel: string
  requestTitle: string
  messagePreview: string
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function conversationMessageEmail({
  accessUrl,
  recipientLabel,
  senderLabel,
  requestTitle,
  messagePreview,
}: ConversationMessageEmailInput) {
  const subject =
    "Nuovo messaggio su Esigenta"
  const greeting = recipientLabel
    ? `Ciao ${recipientLabel},`
    : "Ciao,"

  const text = [
    greeting,
    "",
    `${senderLabel} ha inviato un nuovo messaggio per ${requestTitle}.`,
    "",
    messagePreview,
    "",
    `Apri il messaggio: ${accessUrl}`,
    "",
    "Se non ti aspettavi questo messaggio, puoi ignorare questa email.",
  ].join("\n")

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>${escapeHtml(greeting)}</p>
      <p>${escapeHtml(senderLabel)} ha inviato un nuovo messaggio per ${escapeHtml(requestTitle)}.</p>
      <blockquote style="margin: 16px 0; padding: 12px 16px; border-left: 3px solid #111827; background: #f9fafb;">
        ${escapeHtml(messagePreview)}
      </blockquote>
      <p>
        <a href="${escapeHtml(accessUrl)}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
          Apri messaggio
        </a>
      </p>
      <p>Se non ti aspettavi questo messaggio, puoi ignorare questa email.</p>
    </div>
  `

  return {
    subject,
    html,
    text,
  }
}
