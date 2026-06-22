import { ristrutturareBagnoLanding } from "./ristrutturare-bagno/content";
import { rifareImpiantoElettricoLanding } from "./rifare-impianto-elettrico/content";
import { installareFotovoltaicoLanding } from "./installare-fotovoltaico/content";
import { rifareTettoLanding } from "./rifare-tetto/content";
import { installareClimatizzatoreLanding } from "./installare-climatizzatore/content";
import type { SeoInterventionLanding } from "./types";

export type { SeoInterventionLanding } from "./types";

const all: readonly SeoInterventionLanding[] = [
  ristrutturareBagnoLanding,
  rifareImpiantoElettricoLanding,
  installareFotovoltaicoLanding,
  rifareTettoLanding,
  installareClimatizzatoreLanding,
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
