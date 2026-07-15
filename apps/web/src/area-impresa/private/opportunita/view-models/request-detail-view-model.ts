export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
  }).format(date)
}

export function getRequestUnlockError(
  value?: string | string[],
): "insufficient_credits" | null {
  const rawValue = Array.isArray(value) ? value[0] : value
  return rawValue === "insufficient_credits" ? rawValue : null
}
