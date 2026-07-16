import {
  readCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"
import {
  DEFAULT_DENIED_GOOGLE_CONSENT_STATE,
  toGoogleConsentState,
} from "./google-consent"

const GA4_SCRIPT_ID = "esigenta-ga4-gtag"

type GtagArgs = unknown[]
type GtagFn = (...args: GtagArgs) => void

type GtagWindow = Window &
  typeof globalThis & {
    dataLayer?: GtagArgs[]
    gtag?: GtagFn
    [gaDisableKey: `ga-disable-${string}`]: boolean | undefined
  }

function getGtagWindow(): GtagWindow {
  return window as GtagWindow
}

/**
 * Interruttore ufficiale GA (window['ga-disable-<measurementId>']): a
 * differenza del consent update, questo blocca anche gli eventi automatici
 * interni di gtag.js già caricato (es. engagement/scroll), non solo quelli
 * che invia il nostro codice applicativo.
 */
function setGaDisableFlag(measurementId: string, disabled: boolean): void {
  getGtagWindow()[`ga-disable-${measurementId}`] = disabled
}

/**
 * Rimuove query string e hash: page_path/page_location non devono mai
 * contenere token, callback URL o altri parametri — solo il pathname
 * approvato dall'allowlist.
 */
function sanitizePathname(pathname: string): string {
  const withoutQuery = pathname.split("?", 1)[0] ?? pathname
  return withoutQuery.split("#", 1)[0] ?? withoutQuery
}

function ensureGtagStub(): GtagFn {
  const win = getGtagWindow()

  win.dataLayer = win.dataLayer ?? []

  if (!win.gtag) {
    const dataLayer = win.dataLayer

    win.gtag = function gtag(...args: GtagArgs) {
      dataLayer.push(args)
    }
  }

  return win.gtag
}

/**
 * Risolve quando lo script gtag.js reale ha eseguito il proprio 'load'
 * (non quando il tag <script> è semplicemente presente nel DOM): la sola
 * presenza dell'elemento non prova che il runtime sia pronto a processare
 * comandi accodati prima del suo caricamento. Se lo script esiste già ma
 * non risulta ancora caricato (data-ga4-loaded), si aggancia ai suoi stessi
 * eventi invece di iniettarne uno secondo. Un tag già fallito in precedenza
 * (data-ga4-failed) non riceverà mai più un secondo 'load'/'error' dal
 * browser: va rimosso e ricreato da zero per permettere un retry reale.
 */
function injectGa4Script(measurementId: string): Promise<void> {
  const existing = document.getElementById(
    GA4_SCRIPT_ID,
  ) as HTMLScriptElement | null

  if (existing && existing.dataset.ga4Failed !== "true") {
    if (existing.dataset.ga4Loaded === "true") {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener(
        "error",
        () => reject(new Error("GA4 script failed to load")),
        { once: true },
      )
    })
  }

  existing?.remove()

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")

    script.id = GA4_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`

    script.onload = () => {
      script.dataset.ga4Loaded = "true"
      resolve()
    }
    script.onerror = () => {
      script.dataset.ga4Failed = "true"
      reject(new Error("GA4 script failed to load"))
    }

    document.head.appendChild(script)
  })
}

let ga4ActivationPromise: Promise<void> | null = null

/**
 * Bootstrap GA4 una sola volta per sessione di pagina — va chiamata solo
 * quando preferences.analytics è già true: prima di questo momento nessuno
 * script viene creato, nessun window.gtag esiste, nessuna proprietà
 * ga-disable viene creata. Ordine fisso richiesto da Consent Mode v2, mai
 * invertito: ga-disable a false, stub gtag, consenso default (tutto
 * denied), update con lo stato reale, script gtag.js. gtag('js', ...) e
 * gtag('config', ...) partono SOLO dopo il vero caricamento dello script
 * (mai in coda prima del load): accodarli prima non garantisce che gtag.js
 * li elabori nella pagina reale, a differenza dello snippet ufficiale
 * testato in isolamento. Chiamate concorrenti/successive condividono la
 * stessa Promise: mai un secondo script, mai una seconda js/config. Se lo
 * script fallisce il caricamento, la Promise viene rifiutata e lo stato di
 * attivazione azzerato, cosí un tentativo successivo può ripartire da zero.
 */
export function activateGa4(
  measurementId: string,
  preferences: CookieConsentPreferences,
): Promise<void> {
  if (ga4ActivationPromise) {
    return ga4ActivationPromise
  }

  setGaDisableFlag(measurementId, false)

  const gtag = ensureGtagStub()

  gtag("consent", "default", DEFAULT_DENIED_GOOGLE_CONSENT_STATE)
  gtag("consent", "update", toGoogleConsentState(preferences))

  ga4ActivationPromise = injectGa4Script(measurementId)
    .then(() => {
      gtag("js", new Date())
      gtag("config", measurementId, { send_page_view: false })
    })
    .catch((error: unknown) => {
      ga4ActivationPromise = null
      throw error
    })

  return ga4ActivationPromise
}

export function isGa4Activated(): boolean {
  return ga4ActivationPromise !== null
}

/**
 * Aggiorna i quattro segnali senza mai ricaricare lo script o richiamare
 * config: usata sia quando analytics resta true (es. marketing cambia) sia
 * per la revoca/riattivazione (analytics true <-> false). No-op se GA non è
 * mai stato attivato in questa pagina — non c'è alcun tag ad ascoltare
 * l'update.
 *
 * L'ordine rispetto a ga-disable non è simmetrico, di proposito:
 * - riattivazione (denied -> granted): ga-disable torna false PRIMA
 *   dell'update granted, così il consenso non è mai "granted" mentre il
 *   blocco ufficiale GA è ancora attivo;
 * - revoca (granted -> denied): l'update denied parte, poi ga-disable
 *   scatta true subito dopo, così nessun evento automatico di gtag.js già
 *   caricato (es. engagement) può più uscire, non solo i page_view inviati
 *   dal nostro codice.
 */
export function updateGa4Consent(
  measurementId: string,
  preferences: CookieConsentPreferences,
): void {
  if (!ga4ActivationPromise) {
    return
  }

  const gtag = getGtagWindow().gtag
  const granted = preferences.analytics === true

  if (granted) {
    setGaDisableFlag(measurementId, false)
    gtag?.("consent", "update", toGoogleConsentState(preferences))
  } else {
    gtag?.("consent", "update", toGoogleConsentState(preferences))
    setGaDisableFlag(measurementId, true)
  }
}

/**
 * page_view manuale (send_page_view è disattivato in config): mai inviato
 * se GA non è stato attivato, quindi mai prima del consenso analytics.
 * page_path/page_location usano solo origin + pathname sanitizzato — mai
 * window.location.href, mai query string, mai hash, mai token.
 */
export function sendGa4PageView(pathname: string): void {
  if (!ga4ActivationPromise) {
    return
  }

  const gtag = getGtagWindow().gtag

  if (!gtag) {
    return
  }

  const sanitizedPath = sanitizePathname(pathname)

  gtag("event", "page_view", {
    page_path: sanitizedPath,
    page_location: `${window.location.origin}${sanitizedPath}`,
  })
}

export type TrackGenerateLeadParams = {
  leadType: "customer_request"
  /** Slug tassonomico pubblico già validato lato server, mai testo libero. */
  serviceGroup: string | null
  /** Slug tassonomico pubblico già validato lato server, mai testo libero. */
  intervention: string
}

/**
 * generate_lead per una richiesta cliente realmente acquisita (transazione
 * committata). No-op silenzioso — mai un throw — se: measurementId assente,
 * GA4 mai attivato in questa pagina, script mai caricato con successo
 * (attende la stessa Promise di activateGa4: mai un generate_lead prima di
 * js/config), window.gtag assente, consenso analytics non concesso nelle
 * preferenze CORRENTI (rilette qui, non cache di stato React: un utente può
 * aver revocato dopo l'attivazione), o ga-disable-<id> === true. Nessun
 * requestId/requestCode/dato cliente in ingresso: la firma accetta solo i
 * due slug tassonomici.
 */
export async function trackGenerateLead(
  measurementId: string,
  params: TrackGenerateLeadParams,
): Promise<void> {
  if (!ga4ActivationPromise) {
    return
  }

  try {
    await ga4ActivationPromise
  } catch {
    return
  }

  if (readCookieConsentPreferences()?.analytics !== true) {
    return
  }

  const win = getGtagWindow()

  if (win[`ga-disable-${measurementId}`] === true) {
    return
  }

  const gtag = win.gtag

  if (!gtag) {
    return
  }

  gtag("event", "generate_lead", {
    lead_type: params.leadType,
    ...(params.serviceGroup ? { service_group: params.serviceGroup } : {}),
    intervention: params.intervention,
    send_to: measurementId,
  })
}
