"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"
import { activateGa4, isGa4Activated, sendGa4PageView, updateGa4Consent } from "./ga4"
import { isTrackablePathname } from "./ga4-trackable-routes"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

/**
 * Nessuna UI: orchestratore GA4 gated dal consenso analytics. Monta sempre
 * (come CookieConsent), ma senza NEXT_PUBLIC_GA_MEASUREMENT_ID non fa mai
 * nulla — nessuno script, nessun window.gtag, in nessun ambiente.
 */
export function Ga4Tracker() {
  const pathname = usePathname()
  const [analyticsGranted, setAnalyticsGranted] = useState(false)
  const [ga4Ready, setGa4Ready] = useState(false)

  useEffect(() => {
    const measurementId = GA_MEASUREMENT_ID

    if (!measurementId) {
      return
    }

    let cancelled = false

    const applyPreferences = (preferences: CookieConsentPreferences | null) => {
      if (!preferences) {
        return
      }

      const granted = preferences.analytics === true

      if (granted) {
        const wasAlreadyActivated = isGa4Activated()

        activateGa4(measurementId, preferences)
          .then(() => {
            if (!cancelled) {
              setGa4Ready(true)
            }
          })
          .catch(() => {
            // onerror: activateGa4 azzera già il proprio stato per un
            // eventuale tentativo successivo, niente da fare qui.
          })

        if (wasAlreadyActivated) {
          updateGa4Consent(measurementId, preferences)
        }
      } else if (isGa4Activated()) {
        updateGa4Consent(measurementId, preferences)
      }

      setAnalyticsGranted(granted)
    }

    const initTimeout = window.setTimeout(() => {
      applyPreferences(readCookieConsentPreferences())
    }, 0)

    function handleConsentChanged(event: Event) {
      applyPreferences((event as CustomEvent<CookieConsentPreferences>).detail)
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged)

    return () => {
      cancelled = true
      window.clearTimeout(initTimeout)
      window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged)
    }
  }, [])

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !analyticsGranted || !ga4Ready || !isTrackablePathname(pathname)) {
      return
    }

    sendGa4PageView(pathname)
  }, [pathname, analyticsGranted, ga4Ready])

  return null
}
