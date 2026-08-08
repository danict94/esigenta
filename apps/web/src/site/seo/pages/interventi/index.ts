import { ristrutturareBagnoLanding } from "./ristrutturare-bagno/content";
import { rifareImpiantoElettricoLanding } from "./rifare-impianto-elettrico/content";
import { installareFotovoltaicoLanding } from "./installare-fotovoltaico/content";
import { rifareTettoLanding } from "./rifare-tetto/content";
import { impermeabilizzareTettoLanding } from "./impermeabilizzare-tetto/content";
import { installareClimatizzatoreLanding } from "./installare-climatizzatore/content";
import { impermeabilizzareTerrazzoLanding } from "./impermeabilizzare-terrazzo/content";
import type { SeoInterventionLanding } from "./types";

export type { SeoInterventionLanding } from "./types";

// impermeabilizzareTerrazzoLanding è registrata ma il suo Intervention è
// publicationStatus "draft" nella frozen taxonomy: il gate di pubblicazione
// (static-params.ts + resolve-seo-page.ts) la esclude automaticamente da
// generateStaticParams, sitemap, /servizi e da qualunque lookup pubblico —
// nessuna condizione qui, il registry resta identico per ogni landing.
const all: readonly SeoInterventionLanding[] = [
  ristrutturareBagnoLanding,
  rifareImpiantoElettricoLanding,
  installareFotovoltaicoLanding,
  rifareTettoLanding,
  impermeabilizzareTettoLanding,
  installareClimatizzatoreLanding,
  impermeabilizzareTerrazzoLanding,
];

const bySlug: ReadonlyMap<string, SeoInterventionLanding> = new Map(
  all.map((landing) => [landing.slug, landing]),
);

export function listSeoInterventionLandings(): readonly SeoInterventionLanding[] {
  return all;
}

export function getSeoInterventionLandingBySlug(
  slug: string,
): SeoInterventionLanding | null {
  return bySlug.get(slug) ?? null;
}
