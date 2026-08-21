import type { Prisma } from "@prisma/client"
import type { RequestDraft } from "@esigenta/funnel"

export type RequestVerificationSnapshot = {
  tokenHash: string | null
  expiresAt: string
  sentAt: string
  verifiedAt?: string
  usedAt?: string
}

export type RequestStructuredData = {
  draft: Prisma.JsonValue | null
  verification?: RequestVerificationSnapshot
  /**
   * FASE 6B: identificatore tecnico opaco della compilazione del funnel che
   * ha prodotto questa Request (generato client-side, mai contenente PII —
   * vedi apps/web/.../resolve-funnel-session-id.ts). Puramente diagnostico:
   * un valore assente non significa nulla di anomalo (client vecchio,
   * normalizzazione fallita) e non deve mai essere trattato come un
   * requisito della Request. Non è un id di sessione telemetrica completa —
   * quella è FASE 6C, non ancora implementata.
   */
  funnelSessionId?: string
}

export function toRequestStructuredData({
  draft,
  verification,
  funnelSessionId,
}: {
  draft: RequestDraft
  verification?: RequestVerificationSnapshot
  funnelSessionId?: string
}): Prisma.InputJsonObject {
  const serializedDraft = JSON.parse(JSON.stringify(draft)) as Prisma.InputJsonValue
  return {
    draft: serializedDraft,
    ...(verification
      ? { verification: verification as Prisma.InputJsonValue }
      : {}),
    ...(funnelSessionId ? { funnelSessionId } : {}),
  }
}

export function readRequestStructuredData(value: unknown): RequestStructuredData {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { draft: null }
  }
  return value as RequestStructuredData
}
