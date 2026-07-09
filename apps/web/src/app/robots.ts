import type { MetadataRoute } from "next";

import { resolveSiteOrigin } from "../site/seo/engine/site-url";

/**
 * Qui va solo ciò che non deve essere proprio crawlato: API e aree
 * private/runtime a token. Il funnel /richiesta/* NON va bloccato qui:
 * la sua esclusione dall'indice è il meta noindex sulla pagina, e un
 * Disallow impedirebbe ai crawler di leggerlo. "/area-impresa/" con slash
 * finale blocca solo i sottopercorsi (accedi/iscriviti/area privata), non
 * la landing marketing /area-impresa.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/richieste/",
        "/verifica-richiesta",
        "/stato-richiesta/",
        "/messaggi/",
        "/area-impresa/",
      ],
    },
    sitemap: `${resolveSiteOrigin()}/sitemap.xml`,
  };
}
