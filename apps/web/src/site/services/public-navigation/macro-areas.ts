import type { PublicServiceMacroArea } from "./types";

/**
 * Layer editoriale (Phase 19.6F/19.6H). I TaxonomyDomain restano cluster
 * interni/SEO (decisione 01_SCHEMA.md sezione 20.3) — queste macro aree sono un
 * raggruppamento pubblico separato, non un rename dei domain. La membership reale
 * di ogni macro area è determinata da coverage.ts (ogni intervento dichiara il
 * proprio macroAreaSlug), non dagli array opzionali qui sotto, che servono solo da
 * documentazione leggibile per chi cura questo file.
 */
export const publicServiceMacroAreas: readonly PublicServiceMacroArea[] = [
  {
    slug: "ristrutturazioni",
    name: "Ristrutturazioni",
    sortOrder: 1,
    showInIndex: true,
    includedDomainSlugs: ["ristrutturazione"],
  },
  {
    slug: "cartongesso-e-pareti",
    name: "Cartongesso e pareti",
    sortOrder: 2,
    showInIndex: true,
    includedDomainSlugs: ["ristrutturazione"],
  },
  {
    slug: "imbianchini-e-finiture",
    name: "Imbianchini e finiture",
    sortOrder: 3,
    showInIndex: true,
    includedDomainSlugs: ["ristrutturazione", "facciate"],
  },
  {
    slug: "opere-murarie",
    name: "Opere murarie",
    sortOrder: 4,
    showInIndex: true,
    includedDomainSlugs: ["muratura"],
  },
  {
    slug: "pavimenti-e-piastrelle",
    name: "Pavimenti e piastrelle",
    sortOrder: 5,
    showInIndex: true,
    includedDomainSlugs: ["pavimenti"],
  },
  {
    slug: "tetti-e-facciate",
    name: "Tetti e facciate",
    sortOrder: 6,
    showInIndex: true,
    includedDomainSlugs: ["tetti", "facciate"],
  },
  {
    slug: "impianti-elettrici",
    name: "Impianti elettrici",
    sortOrder: 7,
    showInIndex: true,
    includedDomainSlugs: ["impianti-elettrici"],
  },
  {
    slug: "idraulica",
    name: "Idraulica",
    sortOrder: 8,
    showInIndex: true,
    includedDomainSlugs: ["idraulica"],
  },
  {
    slug: "clima-ed-energia",
    name: "Clima ed energia",
    sortOrder: 9,
    showInIndex: true,
    includedDomainSlugs: ["clima-energia"],
  },
  {
    slug: "nuove-costruzioni-e-ampliamenti",
    name: "Nuove costruzioni e ampliamenti",
    sortOrder: 10,
    showInIndex: true,
    includedDomainSlugs: ["costruzione"],
  },
  {
    slug: "impermeabilizzazioni",
    name: "Impermeabilizzazioni",
    sortOrder: 11,
    showInIndex: true,
    includedDomainSlugs: ["impermeabilizzazioni"],
  },
  {
    slug: "piscine",
    name: "Piscine",
    sortOrder: 12,
    showInIndex: true,
    includedDomainSlugs: ["costruzione", "ristrutturazione", "impermeabilizzazioni"],
  },
] as const;

const macroAreasBySlug: ReadonlyMap<string, PublicServiceMacroArea> = new Map(
  publicServiceMacroAreas.map((area) => [area.slug, area]),
);

export function listPublicServiceMacroAreas(): readonly PublicServiceMacroArea[] {
  return publicServiceMacroAreas;
}

export function getPublicServiceMacroAreaBySlug(
  slug: string,
): PublicServiceMacroArea | null {
  return macroAreasBySlug.get(slug) ?? null;
}
