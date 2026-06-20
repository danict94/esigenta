import { listCostGuides } from "../pages/costi";
import type { CostGuide } from "../pages/costi";

export type CostHubCategoryGroup = {
  slug: string;
  name: string;
  guides: readonly CostGuide[];
};

/**
 * Raggruppa le guide costo realmente esistenti per hubCategory (Phase 20.2).
 * Nessuna categoria è scritta a mano qui: deriva da listCostGuides(), quindi
 * una nuova guida con una nuova hubCategory crea automaticamente un nuovo
 * gruppo al prossimo build, senza toccare questo file o il template.
 * Non può mai produrre una categoria vuota: esiste solo se almeno una guida
 * reale la referenzia.
 */
export function buildCostHubCategoryGroups(): readonly CostHubCategoryGroup[] {
  const guides = listCostGuides();
  const groupsBySlug = new Map<string, CostHubCategoryGroup>();

  for (const guide of guides) {
    const existing = groupsBySlug.get(guide.hubCategory.slug);

    if (existing) {
      groupsBySlug.set(guide.hubCategory.slug, {
        ...existing,
        guides: [...existing.guides, guide],
      });
      continue;
    }

    groupsBySlug.set(guide.hubCategory.slug, {
      slug: guide.hubCategory.slug,
      name: guide.hubCategory.name,
      guides: [guide],
    });
  }

  return [...groupsBySlug.values()];
}
