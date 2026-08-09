export type LegacyQuerySearchParams = Record<
  string,
  string | string[] | undefined
>

/**
 * `?q=` è un residuo di link vecchi (home-hero.tsx non lo genera più): va
 * eliminato prima che qualunque codice client (incluso Analytics) possa
 * vederlo nell'URL. Solo `q` viene rimosso — ogni altro parametro (es. un
 * `gclid` di una campagna Google Ads che ha portato l'utente direttamente
 * su questa pagina) viene preservato intatto nel redirect: altrimenti un
 * click Ads che atterra sul funnel perderebbe l'attribuzione qui, prima
 * ancora che qualunque tag abbia potuto leggerlo dall'URL.
 *
 * Ritorna null se non c'è nulla da correggere (nessun `q` presente): il
 * chiamante allora non deve fare alcun redirect.
 */
export function buildLegacyQueryRedirectTarget({
  requestSlug,
  searchParams,
}: {
  requestSlug: string
  searchParams: LegacyQuerySearchParams
}): string | null {
  if (searchParams.q === undefined) {
    return null
  }

  const preservedParams = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "q" || value === undefined) {
      continue
    }

    for (const singleValue of Array.isArray(value) ? value : [value]) {
      preservedParams.append(key, singleValue)
    }
  }

  const preservedQueryString = preservedParams.toString()
  const path = `/richiesta/${encodeURIComponent(requestSlug)}`

  return preservedQueryString ? `${path}?${preservedQueryString}` : path
}
