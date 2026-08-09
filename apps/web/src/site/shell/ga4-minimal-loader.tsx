"use client"

import { useEffect } from "react"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"
import {
  DENIED_CONSENT_SIGNALS,
  shouldConfigureGoogleAdsDestination,
  toGoogleConsentSignals,
} from "../analytics/consent-signals"

/**
 * SSOT del Measurement ID: stessa env var letta da trackGenerateLead /
 * trackGoogleAdsLeadConversion (site/analytics/ga4-events.ts) — mai più un
 * ID hardcoded qui e uno diverso letto altrove. Se assente, l'intero
 * effect è un no-op: nessun dataLayer, nessun gtag, nessuno script, in
 * nessun ambiente (locale, Preview o produzione). Vedi .env.example.
 */
const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const GA4_SCRIPT_ID = "esigenta-ga4-gtag-standalone"

/**
 * Stesso identificatore già letto da trackGoogleAdsLeadConversion
 * (site/analytics/ga4-events.ts) per il `send_to` dell'evento conversion.
 * Qui serve invece a registrare Google Ads come SECONDA DESTINAZIONE dello
 * stesso, unico tag gtag già caricato per GA4 — non un secondo script.
 * Verificato contro la documentazione ufficiale Google (developers.google.com
 * /tag-platform/gtagjs/routing): `send_to` sull'evento conversion instrada
 * e attribuisce correttamente ANCHE senza questo `config`, ma il pattern
 * ufficiale raccomandato per "adattare un tag Google esistente" a un
 * account Ads (support.google.com/google-ads/answer/7548399) aggiunge
 * comunque questo `config` sul tag condiviso — è quello che garantisce, in
 * modo esplicito e verificabile, che la cattura di gclid nel cookie
 * _gcl_aw avvenga in modo affidabile per QUESTO account Ads specifico, non
 * solo che il singolo evento venga instradato correttamente.
 */
const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID

type GtagWindow = Window &
  typeof globalThis & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }

function getWindow(): GtagWindow {
  return window as GtagWindow
}

/**
 * Guardia SOLO sull'iniezione fisica dello <script> gtag/js — mai sul
 * consenso. `consent default: denied` viene reinviato a ogni mount (ogni
 * navigazione client-side tra route con layout diversi, es. da una landing
 * a /richiesta/[slug]), com'è corretto fare a ogni caricamento di pagina
 * secondo Consent Mode v2. La correttezza non viene dal "non ripeterlo",
 * ma dal riapplicare SEMPRE, subito dopo, un `consent update` calcolato
 * dalla preferenza realmente salvata (vedi applyStoredPreferences più
 * sotto). In precedenza l'update era guardato da un flag "già fatto una
 * volta per sessione": un default successivo lo lasciava bloccato su
 * denied per il resto della sessione. Qui l'update non è mai guardato,
 * solo lo script fisico lo è.
 */
let ga4ScriptRequested = false
/** True solo dopo che script.onload è realmente scattato — vedi loadGa4ScriptOnce. */
let ga4ScriptLoaded = false
/** Guardia sul singolo `gtag('config', GOOGLE_ADS_CONVERSION_ID)` — vedi configureGoogleAdsDestinationIfReady. */
let googleAdsDestinationConfigured = false

export function Ga4MinimalLoader() {
  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) {
      return
    }

    const win = getWindow()

    win.dataLayer = win.dataLayer || []

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- la firma serve solo a tipizzare le chiamate; il corpo usa `arguments`, non questo parametro
    function gtag(...args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params -- replica letterale dello snippet ufficiale Google (arguments, non args)
      win.dataLayer!.push(arguments)
    }
    win.gtag = gtag

    gtag("consent", "default", DENIED_CONSENT_SIGNALS)

    // `config` va sempre dopo `js` — mai prima, mai fuori da onload — per
    // non alterare la sequenza già validata empiricamente per GA4 (vedi
    // commento sopra la funzione). Per questo la destinazione Ads viene
    // configurata SOLO da qui dentro (se il marketing è già concesso al
    // momento del load) o da configureGoogleAdsDestinationIfReady chiamata
    // DOPO che ga4ScriptLoaded è già true (mai prima).
    function configureGoogleAdsDestinationIfReady() {
      const conversionId = GOOGLE_ADS_CONVERSION_ID

      if (!conversionId) {
        return
      }

      if (
        !shouldConfigureGoogleAdsDestination({
          scriptLoaded: ga4ScriptLoaded,
          alreadyConfigured: googleAdsDestinationConfigured,
          preferences: readCookieConsentPreferences(),
        })
      ) {
        return
      }

      googleAdsDestinationConfigured = true
      gtag("config", conversionId)
    }

    function loadGa4ScriptOnce() {
      if (ga4ScriptRequested || document.getElementById(GA4_SCRIPT_ID)) {
        return
      }

      ga4ScriptRequested = true

      const script = document.createElement("script")

      script.id = GA4_SCRIPT_ID
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`

      script.onload = () => {
        gtag("js", new Date())
        gtag("config", GA4_MEASUREMENT_ID)
        ga4ScriptLoaded = true
        configureGoogleAdsDestinationIfReady()
      }

      document.head.appendChild(script)
    }

    function applyStoredPreferences(preferences: CookieConsentPreferences) {
      gtag("consent", "update", toGoogleConsentSignals(preferences))

      // Un solo tag Google (questo script) serve sia l'evento GA4
      // (generate_lead) sia l'evento Google Ads (conversion): va caricato
      // appena l'utente concede ANALYTICS O MARKETING, non solo analytics
      // — altrimenti un utente che accetta solo il consenso pubblicitario
      // avrebbe un evento Ads che "spara" nel dataLayer senza che lo
      // script reale l'abbia mai processato.
      if (preferences.analytics === true || preferences.marketing === true) {
        loadGa4ScriptOnce()
      }

      // Copre il caso in cui lo script sia già stato caricato in questa
      // sessione (mount precedente, es. su un'altra route) prima che il
      // marketing fosse concesso: qui il consenso è appena arrivato, lo
      // script è già attivo, quindi la config Ads può partire subito senza
      // aspettare un nuovo onload (che non arriverebbe mai una seconda
      // volta). Se lo script non è ancora caricato, questa chiamata è un
      // no-op silenzioso: ci penserà onload sopra non appena finisce.
      if (preferences.marketing === true) {
        configureGoogleAdsDestinationIfReady()
      }
    }

    const preferences = readCookieConsentPreferences()

    if (preferences) {
      applyStoredPreferences(preferences)
    }

    function handleConsentChanged(event: Event) {
      const detail = (event as CustomEvent<CookieConsentPreferences>).detail

      if (detail) {
        applyStoredPreferences(detail)
      }
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged)

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChanged,
      )
    }
  }, [])

  return null
}
