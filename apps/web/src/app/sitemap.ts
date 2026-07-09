import type { MetadataRoute } from "next";

import { listProfessionPageCategorySlugs } from "@esigenta/taxonomy";

import { listSeoIndexablePaths } from "../site/seo/engine/sitemap";
import { toAbsoluteUrl } from "../site/seo/engine/site-url";

/**
 * Solo pagine pubbliche pubblicabili: hub statici, famiglia site/seo (dai
 * registry, con policy città già applicata) e pagine professione (dallo
 * stesso helper DB che genera le route). Niente /richiesta/*, aree private,
 * pagine runtime o URL costruiti fuori dai registry. Nessun lastModified:
 * non tracciamo ancora date di revisione reali dei contenuti, meglio ometterlo
 * che inventarlo a ogni build.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const professionSlugs = await listProfessionPageCategorySlugs();

  const paths = [
    "/",
    "/servizi",
    ...listSeoIndexablePaths(),
    ...professionSlugs.map((slug) => `/professionisti/${slug}`),
  ];

  return paths.map((path) => ({ url: toAbsoluteUrl(path) }));
}
