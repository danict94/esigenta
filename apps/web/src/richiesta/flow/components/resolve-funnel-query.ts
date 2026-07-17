const FUNNEL_QUERY_SESSION_STORAGE_PREFIX = "esigenta:richiesta:query:"

/**
 * Oltre questa soglia una query salvata si considera stantia e viene
 * scartata: evita che un vecchio testo resti riutilizzabile a tempo
 * indeterminato per lo stesso interventionSlug (es. si torna sulla stessa
 * route giorni dopo, senza una nuova ricerca dalla home). 30 minuti coprono
 * comodamente refresh/back durante la compilazione del funnel, senza
 * rischiare di far sopravvivere il testo oltre la sessione d'uso reale.
 */
const FUNNEL_QUERY_MAX_AGE_MS = 30 * 60 * 1000

type StoredFunnelQuery = {
  value: string
  storedAt: number
}

function storageKeyFor(interventionSlug: string): string {
  return FUNNEL_QUERY_SESSION_STORAGE_PREFIX + interventionSlug
}

/**
 * Scrive il testo libero digitato in home, con timestamp per la scadenza.
 * Sovrascrive sempre l'eventuale valore precedente per lo stesso slug: una
 * nuova ricerca rimpiazza la precedente, mai accumulo.
 */
export function storeFunnelQuery(interventionSlug: string, value: string): void {
  if (typeof window === "undefined") {
    return
  }

  const stored: StoredFunnelQuery = { value, storedAt: Date.now() }

  window.sessionStorage.setItem(storageKeyFor(interventionSlug), JSON.stringify(stored))
}

/**
 * Legge il testo libero salvato per questo interventionSlug, se ancora
 * presente e non scaduto. Un valore scaduto o non parsabile viene rimosso
 * subito (mai riletto una seconda volta), ma la sola lettura di un valore
 * VALIDO non lo cancella: refresh/back durante la compilazione del funnel
 * devono continuare a trovarlo.
 */
export function resolveFunnelQuery(interventionSlug: string): string | undefined {
  if (typeof window === "undefined") {
    return undefined
  }

  const key = storageKeyFor(interventionSlug)
  const raw = window.sessionStorage.getItem(key)

  if (!raw) {
    return undefined
  }

  try {
    const stored = JSON.parse(raw) as StoredFunnelQuery

    if (
      typeof stored.value !== "string" ||
      typeof stored.storedAt !== "number" ||
      Date.now() - stored.storedAt > FUNNEL_QUERY_MAX_AGE_MS
    ) {
      window.sessionStorage.removeItem(key)
      return undefined
    }

    return stored.value
  } catch {
    window.sessionStorage.removeItem(key)
    return undefined
  }
}
