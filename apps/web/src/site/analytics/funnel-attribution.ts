const FUNNEL_ATTRIBUTION_STORAGE_KEY = "esigenta:funnel-attribution"

/** Stesso limite già usato altrove per campi di testo brevi — vedi packages/domain/.../funnel-events. */
const MAX_ATTRIBUTION_FIELD_LENGTH = 128

export type FunnelAttribution = {
  gclid?: string
  gbraid?: string
  wbraid?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmTerm?: string
  utmContent?: string
}

/**
 * Unici 8 parametri di query string letti — mai l'intera query string, mai
 * un parametro arbitrario. Chiave = nome reale nell'URL, valore = chiave
 * corrispondente su FunnelAttribution/FunnelEvent.
 */
const ATTRIBUTION_PARAM_MAP: Record<string, keyof FunnelAttribution> = {
  gclid: "gclid",
  gbraid: "gbraid",
  wbraid: "wbraid",
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_term: "utmTerm",
  utm_content: "utmContent",
}

function normalizeAttributionValue(value: string | null): string | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()

  if (!trimmed || trimmed.length > MAX_ATTRIBUTION_FIELD_LENGTH) {
    return undefined
  }

  return trimmed
}

function readAttributionFromCurrentUrl(): FunnelAttribution | null {
  const params = new URLSearchParams(window.location.search)
  const attribution: FunnelAttribution = {}
  let hasAny = false

  for (const [param, key] of Object.entries(ATTRIBUTION_PARAM_MAP)) {
    const normalized = normalizeAttributionValue(params.get(param))

    if (normalized) {
      attribution[key] = normalized
      hasAny = true
    }
  }

  return hasAny ? attribution : null
}

function readStoredAttribution(): FunnelAttribution | null {
  const raw = window.sessionStorage.getItem(FUNNEL_ATTRIBUTION_STORAGE_KEY)

  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as unknown

    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as FunnelAttribution)
      : null
  } catch {
    return null
  }
}

/**
 * FASE 6E — cattura-poi-leggi, idempotente e sicura da chiamare da più
 * punti senza dipendere dall'ordine (vedi funnel-attribution-capture.tsx,
 * montato una volta nel root layout su OGNI pagina, e request-stepper.tsx,
 * che la richiama di nuovo al momento di funnel_started):
 *
 * 1. Se l'URL corrente contiene almeno uno dei parametri supportati,
 *    scrive/SOVRASCRIVE l'intero oggetto in sessionStorage e lo ritorna —
 *    l'arrivo più recente con parametri di tracking vince.
 * 2. Altrimenti rilegge quanto già in sessionStorage (se presente) — così
 *    un successivo router.push verso /richiesta/[slug], la cui URL non
 *    contiene più i parametri originali, non perde l'attribution già
 *    catturata su una pagina precedente della stessa scheda.
 * 3. Se non c'è né l'uno né l'altro, null — nessun errore, nessun crash:
 *    un accesso diretto senza alcun parametro è un caso normale (Caso E).
 *
 * Nessuna lettura di consenso qui, di proposito: la CATTURA (locale,
 * effimera, first-party) è sempre eseguita indipendentemente da
 * analytics/marketing — l'eventuale gate su `marketing` per
 * gclid/gbraid/wbraid avviene solo più tardi, al momento dell'invio a
 * funnel_started (vedi applyAttributionConsent più sotto e
 * request-stepper.tsx — CONSENT DECISION REQUIRED, vedi report FASE 6E).
 */
export function resolveFunnelAttribution(): FunnelAttribution | null {
  if (typeof window === "undefined") {
    return null
  }

  const fromUrl = readAttributionFromCurrentUrl()

  if (fromUrl) {
    window.sessionStorage.setItem(
      FUNNEL_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(fromUrl),
    )

    return fromUrl
  }

  return readStoredAttribution()
}

/**
 * CONSENT DECISION REQUIRED (FASE 6E) — non risolto da questo codebase,
 * vedi report. gclid/gbraid/wbraid sono identificatori di click Google
 * Ads; se Esigenta possa persisterli first-party senza consenso
 * `marketing` è oggi ambiguo nel modello di consenso esistente. Questa
 * funzione applica la lettura più conservativa disponibile come DEFAULT
 * — non una posizione legale verificata — riusando lo stesso flag
 * `marketing` già usato per il conversion tracking Google Ads
 * (consent-signals.ts), mai una nuova classificazione. I parametri UTM
 * NON sono soggetti a questo gate: sono semplice tagging di campagna, non
 * un identificatore specifico di Google Ads.
 */
export function applyAttributionConsent(
  attribution: FunnelAttribution | null,
  hasMarketingConsent: boolean,
): FunnelAttribution | null {
  if (!attribution) {
    return null
  }

  if (hasMarketingConsent) {
    return attribution
  }

  const utmOnly: FunnelAttribution = {
    utmSource: attribution.utmSource,
    utmMedium: attribution.utmMedium,
    utmCampaign: attribution.utmCampaign,
    utmTerm: attribution.utmTerm,
    utmContent: attribution.utmContent,
  }

  for (const key of Object.keys(utmOnly) as Array<keyof FunnelAttribution>) {
    if (utmOnly[key] === undefined) {
      delete utmOnly[key]
    }
  }

  return Object.keys(utmOnly).length > 0 ? utmOnly : null
}
