"use client"

import { useEffect } from "react"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"

const GA4_MEASUREMENT_ID = "G-TWH30WBSXF"
const GA4_SCRIPT_ID = "esigenta-ga4-gtag-standalone"

type GtagWindow = Window &
  typeof globalThis & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }

function getWindow(): GtagWindow {
  return window as GtagWindow
}

let activated = false

/**
 * Isolamento conclusivo: replica letterale, fuori da ga4.ts, della sequenza
 * di apps/web/public/ga4-diagnostic.html (l'unica finora che ha prodotto
 * /g/collect 204 in produzione). Nessuna dipendenza dall'astrazione
 * esistente, nessuna Promise/stato condivisi con il vecchio sistema: se
 * anche questa fallisce sulla home reale, il problema non è nella logica
 * applicativa ma nel runtime Next.js/React stesso.
 */
export function Ga4MinimalLoader() {
  useEffect(() => {
    const win = getWindow()

    win.dataLayer = win.dataLayer || []

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- la firma serve solo a tipizzare le chiamate; il corpo usa `arguments`, non questo parametro
    function gtag(...args: unknown[]) {
      // eslint-disable-next-line prefer-rest-params -- replica letterale dello snippet ufficiale Google (arguments, non args)
      win.dataLayer!.push(arguments)
    }
    win.gtag = gtag

    gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    })

    function activate(preferences: CookieConsentPreferences) {
      if (activated || preferences.analytics !== true) {
        return
      }

      activated = true

      gtag("consent", "update", { analytics_storage: "granted" })

      if (document.getElementById(GA4_SCRIPT_ID)) {
        return
      }

      const script = document.createElement("script")

      script.id = GA4_SCRIPT_ID
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`

      script.onload = () => {
        gtag("js", new Date())
        gtag("config", GA4_MEASUREMENT_ID)
      }

      document.head.appendChild(script)
    }

    const preferences = readCookieConsentPreferences()

    if (preferences) {
      activate(preferences)
    }

    function handleConsentChanged(event: Event) {
      const detail = (event as CustomEvent<CookieConsentPreferences>).detail

      if (detail) {
        activate(detail)
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
