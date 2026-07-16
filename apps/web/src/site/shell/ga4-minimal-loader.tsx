"use client"

import { useEffect } from "react"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"
import { activateGa4, isGa4Activated, updateGa4Consent } from "./ga4"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Prova temporanea sulla home: nessuna logica di route/page_view, nessuna
 * seconda implementazione di dataLayer/gtag/script — solo lettura/ascolto
 * del consenso e delega a ga4.ts, unica fonte di verità condivisa anche con
 * trackGenerateLead.
 */
export function Ga4MinimalLoader() {
  useEffect(() => {
    const measurementId = GA_MEASUREMENT_ID

    if (!measurementId) {
      return
    }

    const applyPreferences = (preferences: CookieConsentPreferences | null) => {
      if (!preferences) {
        return
      }

      const granted = preferences.analytics === true

      if (granted) {
        if (isGa4Activated()) {
          updateGa4Consent(measurementId, preferences)
        } else {
          activateGa4(measurementId, preferences).catch(() => {
            // onerror: activateGa4 azzera già il proprio stato per un
            // eventuale tentativo successivo, niente da fare qui.
          })
        }
      } else if (isGa4Activated()) {
        updateGa4Consent(measurementId, preferences)
      }
    }

    const initTimeout = window.setTimeout(() => {
      applyPreferences(readCookieConsentPreferences())
    }, 0)

    function handleConsentChanged(event: Event) {
      applyPreferences((event as CustomEvent<CookieConsentPreferences>).detail)
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged)

    return () => {
      window.clearTimeout(initTimeout)
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChanged,
      )
    }
  }, [])

  return null
}
