import { listSeoInterventionLandings } from "../pages/interventi";
import {
  listCostGuides,
  listIndexableCostGuideCityPages,
} from "../pages/costi";
import { listSeoGroupLandings } from "../pages/gruppi";
import { buildCanonicalPath } from "./canonical";

/**
 * Percorsi indicizzabili di proprietà di site/seo, derivati dagli stessi
 * registry usati da static-params.ts: se una pagina non viene generata, non
 * può entrare in sitemap, e viceversa. Le pagine città passano dalla stessa
 * policy di geo-policy.ts (listIndexableCostGuideCityPages): draft/thin
 * restano fuori senza bisogno di liste scritte a mano.
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
    ...costGuides.flatMap((guide) =>
      listIndexableCostGuideCityPages(guide.slug).map(
        (cityPage) => cityPage.canonicalPath,
      ),
    ),
  ];
}
