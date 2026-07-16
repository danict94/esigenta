import type { CookieConsentPreferences } from "./cookie-consent-storage"
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

function injectGa4Script(measurementId: string): void {
  if (document.getElementById(GA4_SCRIPT_ID)) {
    return
  }

  const script = document.createElement("script")

  script.id = GA4_SCRIPT_ID
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`

  document.head.appendChild(script)
}

let ga4Activated = false

/**
 * Bootstrap GA4 una sola volta per sessione di pagina — va chiamata solo
 * quando preferences.analytics è già true: prima di questo momento nessuno
 * script viene creato, nessun window.gtag esiste, nessuna proprietà
 * ga-disable viene creata. Ordine fisso richiesto da Consent Mode v2, mai
 * invertito: ga-disable a false, stub gtag, consenso default (tutto
 * denied), update con lo stato reale, script gtag.js, gtag('js', ...),
 * gtag('config', ...). Chiamate successive sono no-op: l'attivazione non si
 * ripete mai nella stessa pagina.
 */
export function activateGa4(
  measurementId: string,
  preferences: CookieConsentPreferences,
): void {
  if (ga4Activated) {
    return
  }

  ga4Activated = true

  setGaDisableFlag(measurementId, false)

  const gtag = ensureGtagStub()

  gtag("consent", "default", DEFAULT_DENIED_GOOGLE_CONSENT_STATE)
  gtag("consent", "update", toGoogleConsentState(preferences))

  injectGa4Script(measurementId)

  gtag("js", new Date())
  gtag("config", measurementId, { send_page_view: false })
}

export function isGa4Activated(): boolean {
  return ga4Activated
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
  if (!ga4Activated) {
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
  if (!ga4Activated) {
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
