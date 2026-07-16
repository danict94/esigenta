const TRACKABLE_EXACT_PATHS = new Set([
  "/",
  "/servizi",
  "/costi",
  "/privacy",
  "/cookie-policy",
  "/termini",
  // Solo la landing pubblica: il resto di /area-impresa, incluse le route di
  // autenticazione (accedi, iscriviti, recupera/reimposta password) e
  // l'area privata (dashboard, richieste, messaggi, crediti...), resta
  // fuori — le route auth non aggiungono segnale di misurazione utile e
  // restano più vicine a un flusso sensibile che a contenuto pubblico.
  "/area-impresa",
])

const TRACKABLE_PATH_PREFIXES = [
  "/servizi/",
  "/interventi/",
  "/costi/",
  "/professionisti/",
]

/**
 * Allowlist esplicita, non blocklist: solo le pagine pubbliche di
 * marketing/SEO sono tracciate. Il funnel richiesta, l'accesso clienti,
 * l'area impresa privata e le route con token nel path (stato-richiesta,
 * verifica-richiesta) restano fuori per costruzione — una nuova route
 * futura non finisce tracciata per dimenticanza, deve essere aggiunta qui
 * esplicitamente dopo una verifica reale di cosa contiene il suo pathname.
 */
export function isTrackablePathname(pathname: string): boolean {
  if (TRACKABLE_EXACT_PATHS.has(pathname)) {
    return true
  }

  return TRACKABLE_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}
