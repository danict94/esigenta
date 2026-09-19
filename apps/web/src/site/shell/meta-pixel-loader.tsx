"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

import {
  initializeMetaPixel,
  trackMetaPageView,
} from "../analytics/meta-pixel"
import {
  COOKIE_CONSENT_CHANGED_EVENT,
  readCookieConsentPreferences,
  type CookieConsentPreferences,
} from "./cookie-consent-storage"

function currentPageKey(): string {
  return `${window.location.pathname}${window.location.search}`
}

/** Loader client del Pixel Meta, limitato al consenso marketing. */
export function MetaPixelLoader() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const pageKey = searchParams.size > 0
    ? `${pathname}?${searchParams.toString()}`
    : pathname

  useEffect(() => {
    function applyPreferences(preferences: CookieConsentPreferences | null) {
      if (preferences?.marketing !== true) {
        return
      }

      initializeMetaPixel()
      trackMetaPageView(currentPageKey())
    }

    applyPreferences(readCookieConsentPreferences())

    function handleConsentChanged(event: Event) {
      const preferences = (event as CustomEvent<CookieConsentPreferences>).detail

      applyPreferences(preferences)
    }

    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleConsentChanged)

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_CHANGED_EVENT,
        handleConsentChanged,
      )
    }
  }, [pageKey])

  return null
}
