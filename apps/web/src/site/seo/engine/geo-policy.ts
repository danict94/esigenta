import type { CostGuideCityPage } from "../pages/costi/types";

/**
 * Owner reale della policy di qualità minima per generare/mostrare una
 * pagina città (prima viveva, di fatto, dentro pages/costi/index.ts).
 * pages/costi/index.ts resta registry e ri-esporta questa funzione, non la
 * definisce.
 *
 * Fase 5.E — nome storico, ma NON decide più l'indice: una pagina che passa
 * questo controllo viene generata, è raggiungibile e può essere linkata
 * dalla guida nazionale, ma il tag noindex (engine/metadata.ts) e l'esclusione
 * dalla sitemap (engine/sitemap.ts) sono oggi una decisione di prodotto
 * separata e valgono per TUTTE le pagine città, a prescindere da questo
 * risultato — finché non avranno dati locali reali, non solo fascia
 * nazionale con lettura locale.
 */
export function isIndexableCityPage(cityPage: CostGuideCityPage): boolean {
  const hasMinimumLocalContent =
    cityPage.localReading.trim().length > 0 && cityPage.faq.length > 0;

  return (
    cityPage.seoEnabled === true &&
    cityPage.contentStatus === "ready" &&
    cityPage.uniquenessLevel !== "thin" &&
    hasMinimumLocalContent
  );
}
