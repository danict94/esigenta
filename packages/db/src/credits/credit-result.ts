export type CreditLedgerResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      code: string
      message: string
    }

export function normalizeRequiredText(
  value: string | null | undefined,
): string | null {
  const trimmed =
    value?.trim()

  return trimmed
    ? trimmed
    : null
}