import { listSeoInterventionLandings } from "../pages/interventi";
import { listCostGuides } from "../pages/costi";
import { listSeoGroupLandings } from "../pages/gruppi";
import { buildCanonicalPath } from "./canonical";

/**
 * Percorsi indicizzabili di proprietà di site/seo, derivati dagli stessi
 * registry usati da static-params.ts: se una pagina non viene generata, non
 * può entrare in sitemap, e viceversa.
 *
 * Fase 5.E — le pagine città delle guide costi sono generate e crawlabili
 * (vedi static-params.ts) ma restano fuori da qui: leggono la fascia
 * nazionale, non un prezzo locale reale, quindi non vanno spinte in indice.
 * Sono noindex via engine/metadata.ts, coerente con l'esclusione qui sotto.
 */
export function listSeoIndexablePaths(): string[] {
  const costGuides = listCostGuides();

  return [
    "/costi",
    ...listSeoGroupLandings().map((landing) =>
      buildCanonicalPath({ family: "groupHub", slug: landing.slug }),
    ),
    ...listSeoInterventionLandings().map((landing) =>
      buildCanonicalPath({ family: "intervention", slug: landing.slug }),
    ),
    ...costGuides.map((guide) => guide.canonicalPath),
  ];
}
