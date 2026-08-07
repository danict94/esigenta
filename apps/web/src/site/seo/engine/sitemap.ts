import { isInterventionPublished } from "@esigenta/taxonomy";

import { listSeoInterventionLandings } from "../pages/interventi";
import { listCostGuides } from "../pages/costi";
import { listSeoGroupLandings } from "../pages/gruppi";
import { buildCanonicalPath } from "./canonical";

/**
 * Percorsi indicizzabili di proprietà di site/seo, derivati dagli stessi
 * registry usati da static-params.ts: se una pagina non viene generata, non
 * può entrare in sitemap, e viceversa. Stesso filtro di pubblicazione
 * applicato lì (frozen taxonomy, nessuna query DB): un Intervention draft
 * non produce mai un URL in sitemap, anche se una landing/guida è già
 * registrata in fase di sviluppo.
 *
 * Fase 5.E — le pagine città delle guide costi sono generate e crawlabili
 * (vedi static-params.ts) ma restano fuori da qui: leggono la fascia
 * nazionale, non un prezzo locale reale, quindi non vanno spinte in indice.
 * Sono noindex via engine/metadata.ts, coerente con l'esclusione qui sotto.
 */
export function listSeoIndexablePaths(): string[] {
  const costGuides = listCostGuides().filter((guide) =>
    isInterventionPublished(guide.interventionSeoSlug),
  );

  return [
    "/costi",
    ...listSeoGroupLandings().map((landing) =>
      buildCanonicalPath({ family: "groupHub", slug: landing.slug }),
    ),
    ...listSeoInterventionLandings()
      .filter((landing) => isInterventionPublished(landing.slug))
      .map((landing) =>
        buildCanonicalPath({ family: "intervention", slug: landing.slug }),
      ),
    ...costGuides.map((guide) => guide.canonicalPath),
  ];
}
