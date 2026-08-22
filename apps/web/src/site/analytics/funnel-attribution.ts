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

/**
 * FASE 7D: window.sessionStorage.getItem itself (not just a malformed
 * value) can throw in some locked-down browser configurations — same
 * class of failure already hardened for the funnel session id in
 * resolve-funnel-session-id.ts (FASE 7C).
 *
 * FASE 7E: unlike the FASE 7D version, this no longer silently coalesces
 * a failure into "nothing stored" — that early coalescing is exactly what
 * made a real storage failure indistinguishable from Caso E (genuinely no
 * attribution) by the time it reached resolveFunnelStartedAttribution
 * (caught by a real concurrent-race-style test, not assumed). Returns a
 * discriminated result instead, so the failure survives long enough for
 * the caller that actually needs to know about it (resolveFunnelAttributionWithStatus below) to see it — while readStoredAttribution
 * (used by the plain, status-agnostic resolveFunnelAttribution) still
 * collapses it to "nothing", unchanged external behavior for that caller.
 */
type StorageReadResult =
  | { ok: true; value: string | null }
  | { ok: false }

function safeReadStoredRaw(): StorageReadResult {
  try {
    return { ok: true, value: window.sessionStorage.getItem(FUNNEL_ATTRIBUTION_STORAGE_KEY) }
  } catch {
    return { ok: false }
  }
}

/**
 * Same principle as safeReadStoredRaw above, but a failed WRITE is
 * deliberately never treated as an attribution-resolution failure (see
 * resolveFunnelAttributionWithStatus): it only costs the sessionStorage
 * mirror, never the freshly-captured value the caller already has in
 * hand from the URL in the same call.
 */
function safeWriteStoredRaw(attribution: FunnelAttribution): void {
  try {
    window.sessionStorage.setItem(
      FUNNEL_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify(attribution),
    )
  } catch {
    // Best-effort mirror only — see resolveFunnelAttributionWithStatus.
  }
}

type AttributionReadResult = { ok: boolean; attribution: FunnelAttribution | null }

/**
 * Corrupted/unparsable JSON already in storage is NOT a storage-access
 * failure — the read itself succeeded, what was stored is simply garbage
 * — so this returns ok:true with attribution:null in that case, same as
 * "nothing stored". Only a genuine failure to even read the raw string
 * (safeReadStoredRaw's ok:false) produces ok:false here.
 */
function readStoredAttributionWithStatus(): AttributionReadResult {
  const raw = safeReadStoredRaw()

  if (!raw.ok) {
    return { ok: false, attribution: null }
  }

  if (!raw.value) {
    return { ok: true, attribution: null }
  }

  try {
    const parsed = JSON.parse(raw.value) as unknown

    return {
      ok: true,
      attribution:
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? (parsed as FunnelAttribution)
          : null,
    }
  } catch {
    return { ok: true, attribution: null }
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
/**
 * FASE 7E: same logic as resolveFunnelAttribution below, but surfaces
 * whether resolution genuinely succeeded (ok:true, whether or not
 * anything was found) or a storage read failed (ok:false) — the one
 * signal resolveFunnelStartedAttribution needs to tell Caso A (no
 * attribution) apart from Caso B (couldn't determine). Writing the
 * URL-captured value to sessionStorage is still best-effort here (see
 * safeWriteStoredRaw): a write failure never turns ok:true into
 * ok:false, since the value itself was still captured successfully.
 */
function resolveFunnelAttributionWithStatus(): AttributionReadResult {
  if (typeof window === "undefined") {
    return { ok: true, attribution: null }
  }

  const fromUrl = readAttributionFromCurrentUrl()

  if (fromUrl) {
    safeWriteStoredRaw(fromUrl)

    return { ok: true, attribution: fromUrl }
  }

  return readStoredAttributionWithStatus()
}

export function resolveFunnelAttribution(): FunnelAttribution | null {
  return resolveFunnelAttributionWithStatus().attribution
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

/**
 * FASE 7D — unico punto che request-stepper.tsx chiama per calcolare
 * l'attribution di funnel_started. Isola resolveFunnelAttribution() +
 * applyAttributionConsent() (già hardened sopra per il proprio accesso a
 * sessionStorage, ma questo è un secondo livello di difesa contro
 * qualunque altro fallimento non ancora previsto) dietro un unico
 * try/catch: un fallimento qui deve poter costare SOLO i campi
 * attribution, mai l'intero evento funnel_started — vedi report FASE 7D.
 *
 * FASE 7E: il ritorno non è più solo `FunnelAttribution | null` — porta
 * anche uno `status` esplicito, perché "nessuna attribution" e
 * "attribution non determinabile" sono fatti diversi che prima
 * risultavano indistinguibili (stesso `null`, stesso payload DB con tutti
 * i campi assenti). `status: "resolved"` copre sia il caso con dati
 * (attribution non nulla) sia il caso senza — la risoluzione è comunque
 * riuscita, non c'è stato alcun errore, il fatto che non ci sia nulla da
 * attribuire è già un'informazione completa. `status: "unknown"` copre
 * solo il ramo catch: la risoluzione stessa è fallita, `attribution` è
 * sempre null in quel caso perché non sappiamo cosa ci fosse davvero.
 * Vedi il commento sul modello FunnelEvent in schema.prisma.
 *
 * Riceve il consenso marketing già letto dal chiamante (mai una nuova
 * lettura di consent-storage qui dentro): request-stepper.tsx resta
 * l'unico punto che legge readCookieConsentPreferences per questo scopo,
 * invariato dalla FASE 6E — vedi il commento lì.
 */
export type FunnelAttributionResolution = {
  status: "resolved" | "unknown"
  attribution: FunnelAttribution | null
}

export function resolveFunnelStartedAttribution(
  hasMarketingConsent: boolean,
): FunnelAttributionResolution {
  try {
    const resolved = resolveFunnelAttributionWithStatus()

    if (!resolved.ok) {
      return { status: "unknown", attribution: null }
    }

    return {
      status: "resolved",
      attribution: applyAttributionConsent(
        resolved.attribution,
        hasMarketingConsent,
      ),
    }
  } catch {
    return { status: "unknown", attribution: null }
  }
}
