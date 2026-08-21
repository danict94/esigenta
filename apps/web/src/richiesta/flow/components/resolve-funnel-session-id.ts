const FUNNEL_SESSION_ID_STORAGE_PREFIX = "esigenta:funnel-session:"

function storageKeyFor(interventionSlug: string): string {
  return FUNNEL_SESSION_ID_STORAGE_PREFIX + interventionSlug
}

/**
 * Identità tecnica stabile di UNA compilazione del funnel per un dato
 * interventionSlug. Non è un identificatore di sessione browser generico,
 * non è collegato in alcun modo al consenso cookie (nessun import da
 * site/shell/cookie-consent-storage qui, di proposito — vedi FASE 6B) e non
 * contiene alcun dato dell'utente: solo un UUID casuale opaco.
 *
 * Creato: al primo mount di RequestStepper per questo interventionSlug in
 * questa scheda, se sessionStorage non ha già un valore per la stessa key.
 * Riusato: refresh, back/forward, cambio step, e qualunque nuovo ingresso su
 * /richiesta/<stesso slug> nella STESSA scheda, finché non viene
 * esplicitamente rimosso da clearFunnelSessionId — nessun timeout/scadenza,
 * a differenza di resolve-funnel-query.ts: qui non c'è testo libero
 * dell'utente che possa "invecchiare male", solo un identificatore opaco
 * che resta valido finché quella compilazione non si conclude.
 * Eliminato: solo dopo una Request realmente creata con successo (vedi
 * request-stepper.tsx, submitDraft) — mai su un submit fallito, un errore
 * di rete o una validazione respinta: lo stesso tentativo deve poter essere
 * ritentato con lo stesso id.
 *
 * Scoped per interventionSlug (non globale): una compilazione su un
 * intervento diverso è una compilazione realmente distinta e ottiene un id
 * proprio, indipendente da quello di un'altra eventualmente abbandonata.
 *
 * Ritorna null solo durante il render lato server (nessuna sessionStorage
 * disponibile): il valore reale nasce al primo render lato client, dentro
 * lo stesso useState(() => resolveFunnelSessionId(...)) — stesso pattern
 * SSR-safe già usato da resolveFunnelQuery.
 */
export function resolveFunnelSessionId(
  interventionSlug: string,
): string | null {
  if (typeof window === "undefined") {
    return null
  }

  const key = storageKeyFor(interventionSlug)
  const existing = window.sessionStorage.getItem(key)

  if (existing) {
    return existing
  }

  const generated = crypto.randomUUID()

  window.sessionStorage.setItem(key, generated)

  return generated
}

/**
 * Rimuove il funnelSessionId di questo interventionSlug. Chiamare SOLO dopo
 * una Request realmente creata con successo (vedi request-stepper.tsx) —
 * mai su un submit fallito o un errore di rete, altrimenti un nuovo
 * tentativo della STESSA compilazione perderebbe l'identificatore che la
 * lega al tentativo precedente.
 */
export function clearFunnelSessionId(interventionSlug: string): void {
  if (typeof window === "undefined") {
    return
  }

  window.sessionStorage.removeItem(storageKeyFor(interventionSlug))
}
