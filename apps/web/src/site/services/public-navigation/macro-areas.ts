import type { PublicServiceMacroArea } from "./types";

/**
 * Layer editoriale (Phase 19.6F/19.6H, ridotto nella refoundation ServiceGroup).
 * Queste macro aree sono un raggruppamento pubblico separato dalla taxonomy. La
 * membership reale di ogni macro area è determinata da coverage.ts (ogni
 * intervento dichiara il proprio macroAreaSlug).
 *
 * Ridotto a 8 macro aree (da 12): "pavimenti-e-piastrelle",
 * "nuove-costruzioni-e-ampliamenti", "impermeabilizzazioni" e "piscine" non
 * hanno più interventi nel catalogo iniziale pulito — verranno reintrodotte
 * quando la taxonomy guadagnerà ServiceGroup/Service per quei settori.
 */
export const publicServiceMacroAreas: readonly PublicServiceMacroArea[] = [
  {
    slug: "ristrutturazioni",
    name: "Ristrutturazioni",
    sortOrder: 1,
    showInIndex: true,
  },
  {
    slug: "cartongesso-e-pareti",
    name: "Cartongesso e pareti",
    sortOrder: 2,
    showInIndex: true,
  },
  {
    slug: "imbianchini-e-finiture",
    name: "Imbianchini e finiture",
    sortOrder: 3,
    showInIndex: true,
  },
  {
    slug: "opere-murarie",
    name: "Opere murarie",
    sortOrder: 4,
    showInIndex: true,
  },
  {
    slug: "tetti-e-facciate",
    name: "Tetti e facciate",
    sortOrder: 5,
    showInIndex: true,
  },
  {
    slug: "impianti-elettrici",
    name: "Impianti elettrici",
    sortOrder: 6,
    showInIndex: true,
  },
  {
    slug: "idraulica",
    name: "Idraulica",
    sortOrder: 7,
    showInIndex: true,
  },
  {
    slug: "clima-ed-energia",
    name: "Clima ed energia",
    sortOrder: 8,
    showInIndex: true,
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
