import { readCookieConsentPreferences } from "../shell/cookie-consent-storage"

/** Identificatore pubblico del dataset Meta "Esigenta Web". */
export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1390555649955776"

const META_PIXEL_SCRIPT_ID = "esigenta-meta-pixel"

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  loaded?: boolean
  queue?: unknown[][]
  version?: string
  __esigentaInitialized?: boolean
}

type MetaPixelWindow = Window &
  typeof globalThis & {
    _fbq?: MetaPixelFunction
    fbq?: MetaPixelFunction
  }

let lastTrackedPageView: string | null = null

function getMetaWindow(): MetaPixelWindow {
  return window as MetaPixelWindow
}

function hasMarketingConsent(): boolean {
  return readCookieConsentPreferences()?.marketing === true
}

/**
 * Inizializza il solo Pixel Meta dopo consenso marketing. Lo stub conserva
 * gli eventi inviati mentre fbevents.js sta caricando; nessun noscript image
 * viene emesso, perché aggirerebbe il consenso.
 */
export function initializeMetaPixel(): boolean {
  if (typeof window === "undefined" || !hasMarketingConsent()) {
    return false
  }

  const win = getMetaWindow()
  let fbq = win.fbq

  if (!fbq) {
    const queue: unknown[][] = []
    const stub = ((...args: unknown[]) => {
      if (stub.callMethod) {
        stub.callMethod.call(stub, ...args)
        return
      }

      queue.push(args)
    }) as MetaPixelFunction

    stub.queue = queue
    stub.loaded = false
    stub.version = "2.0"

    win.fbq = stub
    win._fbq = stub
    fbq = stub
  }

  if (!fbq.__esigentaInitialized) {
    fbq("init", META_PIXEL_ID)
    fbq.__esigentaInitialized = true
  }

  if (!document.getElementById(META_PIXEL_SCRIPT_ID)) {
    const script = document.createElement("script")

    script.id = META_PIXEL_SCRIPT_ID
    script.async = true
    script.src = "https://connect.facebook.net/en_US/fbevents.js"
    document.head.appendChild(script)
  }

  return true
}

/**
 * Un PageView per URL nella singola sessione client. La deduplica protegge
 * dagli effect ripetuti di React e dalle transizioni tra layout App Router.
 */
export function trackMetaPageView(pageKey: string): void {
  if (!initializeMetaPixel() || lastTrackedPageView === pageKey) {
    return
  }

  getMetaWindow().fbq?.("track", "PageView")
  lastTrackedPageView = pageKey
}

/**
 * Evento conversione Meta per una richiesta già persistita con successo.
 * Il chiamante è responsabile della deduplica per singola richiesta.
 */
export function trackMetaLead(): void {
  if (!initializeMetaPixel()) {
    return
  }

  getMetaWindow().fbq?.("track", "Lead")
}
