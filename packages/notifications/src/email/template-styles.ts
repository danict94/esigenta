// Le email non possono dipendere dai web font dell'app: Arial garantisce
// compatibilita' ampia nei client email, con sans-serif come fallback.
// Il root style vive qui per evitare copie divergenti nei singoli template.
export const EMAIL_ROOT_STYLE =
  "font-family: Arial, sans-serif; color: #111827; line-height: 1.6;"
