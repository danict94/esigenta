import type { MetadataRoute } from "next";

import { listProfessionPageCategorySlugs } from "@esigenta/taxonomy";

import { listSeoIndexablePaths, type SitemapEntry } from "../site/seo/engine/sitemap";
import { toAbsoluteUrl } from "../site/seo/engine/site-url";

/**
 * Solo pagine pubbliche pubblicabili: hub statici, famiglia site/seo (dai
 * registry, con policy città già applicata) e pagine professione (dallo
 * stesso helper DB che genera le route). Niente /richiesta/*, aree private,
 * pagine runtime o URL costruiti fuori dai registry.
 *
 * `lastModified`: emesso solo per le URL la cui fonte editoriale dichiara
 * una data reale (validata in listSeoIndexablePaths/editorial-date.ts). "/",
 * "/servizi" e "/professionisti/[slug]" non hanno oggi una fonte editoriale
 * affidabile per la loro ultima modifica significativa — restano senza
 * lastModified, mai un fallback alla data del build o del deploy.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const professionSlugs = await listProfessionPageCategorySlugs();

  const entries: SitemapEntry[] = [
    { path: "/" },
    { path: "/servizi" },
    ...listSeoIndexablePaths(),
    ...professionSlugs.map((slug) => ({ path: `/professionisti/${slug}` })),
  ];

  return entries.map((entry) =>
    entry.lastModified
      ? { url: toAbsoluteUrl(entry.path), lastModified: entry.lastModified }
      : { url: toAbsoluteUrl(entry.path) },
  );
}
