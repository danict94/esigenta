import { ristrutturazioniGroupLanding } from "./ristrutturazioni/content";
import type { SeoGroupLanding } from "./types";

export type { SeoGroupLanding } from "./types";

// Registry only: un gruppo entra qui solo quando la sua landing è pronta
// editorialmente. Tutto il resto (route, sitemap, hub /servizi) deriva da
// questo array — mai abilitare gruppi altrove.
const all: readonly SeoGroupLanding[] = [ristrutturazioniGroupLanding];

const bySlug: ReadonlyMap<string, SeoGroupLanding> = new Map(
  all.map((landing) => [landing.slug, landing]),
);

export function listSeoGroupLandings(): readonly SeoGroupLanding[] {
  return all;
}

export function getSeoGroupLandingBySlug(
  slug: string,
): SeoGroupLanding | null {
  return bySlug.get(slug) ?? null;
}
