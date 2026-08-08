import { isInterventionPublished } from "@esigenta/taxonomy";

import { listSeoInterventionLandings } from "../pages/interventi";
import { listCostGuides } from "../pages/costi";
import { listSeoGroupLandings } from "../pages/gruppi";
import { buildCanonicalPath } from "./canonical";
import { validateEditorialLastModified } from "./editorial-date";

export type SitemapEntry = {
  path: string;
  /** YYYY-MM-DD, già validata. Assente = nessun <lastmod> per questa URL. */
  lastModified?: string;
};

/**
 * Percorsi indicizzabili di proprietà di site/seo, derivati dagli stessi
 * registry usati da static-params.ts: se una pagina non viene generata, non
 * può entrare in sitemap, e viceversa. Stesso filtro di pubblicazione
 * applicato lì (frozen taxonomy, nessuna query DB): un Intervention draft
 * non produce mai un URL in sitemap, anche se una landing/guida è già
 * registrata in fase di sviluppo.
 *
 * `lastModified` (quando presente sulla fonte editoriale) è validato qui,
 * nell'unico punto in cui le tre fonti (CostGuide, SeoInterventionLanding,
 * SeoGroupLanding) confluiscono in un'unica lista — mai una seconda
 * validazione duplicata nei singoli composer. Una data malformata fa
 * fallire il build con un errore esplicito, non produce un XML ambiguo.
 *
 * Fase 5.E — le pagine città delle guide costi sono generate e crawlabili
 * (vedi static-params.ts) ma restano fuori da qui: leggono la fascia
 * nazionale, non un prezzo locale reale, quindi non vanno spinte in indice.
 * Sono noindex via engine/metadata.ts, coerente con l'esclusione qui sotto.
 */
export function listSeoIndexablePaths(): SitemapEntry[] {
  const costGuides = listCostGuides().filter((guide) =>
    isInterventionPublished(guide.interventionSeoSlug),
  );

  return [
    // "/costi" è un hub statico senza una data editoriale propria: nessun
    // fallback, resta senza lastModified come qualunque altra pagina statica.
    { path: "/costi" },
    ...listSeoGroupLandings().map((landing) => ({
      path: buildCanonicalPath({ family: "groupHub", slug: landing.slug }),
      lastModified: validateEditorialLastModified(
        landing.lastModified,
        `SeoGroupLanding "${landing.slug}"`,
      ),
    })),
    ...listSeoInterventionLandings()
      .filter((landing) => isInterventionPublished(landing.slug))
      .map((landing) => ({
        path: buildCanonicalPath({ family: "intervention", slug: landing.slug }),
        lastModified: validateEditorialLastModified(
          landing.lastModified,
          `SeoInterventionLanding "${landing.slug}"`,
        ),
      })),
    ...costGuides.map((guide) => ({
      path: guide.canonicalPath,
      lastModified: validateEditorialLastModified(
        guide.lastModified,
        `CostGuide "${guide.slug}"`,
      ),
    })),
  ];
}
