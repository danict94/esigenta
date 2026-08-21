"use client"

import { useEffect } from "react"

import { resolveFunnelAttribution } from "./funnel-attribution"

/**
 * FASE 6E — montato una sola volta nel root layout, gira a ogni caricamento
 * pieno di pagina su tutto il sito (home, pagine SEO/servizi, o la pagina
 * del funnel stessa). Puro side effect: cattura gclid/gbraid/wbraid/UTM
 * dall'URL corrente in sessionStorage se presenti, così sopravvivono a un
 * successivo router.push client-side verso /richiesta/[slug] la cui URL
 * non li contiene più. Non renderizza nulla — stesso pattern di
 * CookieConsent/Ga4MinimalLoader.
 *
 * Non dipende dall'ordine di montaggio rispetto a RequestStepper: quel
 * componente richiama la STESSA resolveFunnelAttribution() al momento di
 * funnel_started, quindi anche un accesso diretto a /richiesta/[slug] con
 * parametri nell'URL viene catturato correttamente, con o senza questo
 * componente.
 */
export function FunnelAttributionCapture() {
  useEffect(() => {
    resolveFunnelAttribution()
  }, [])

  return null
}
