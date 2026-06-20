import type { ServiceCategory } from "./types";

export const serviceCategories: readonly ServiceCategory[] = [
  { slug: "ristrutturazioni", title: "Ristrutturazioni", order: 1 },
  { slug: "impianti", title: "Impianti", order: 2 },
  { slug: "energia", title: "Energia", order: 3 },
  { slug: "finiture", title: "Finiture", order: 4 },
  { slug: "pratiche-edilizie", title: "Pratiche edilizie", order: 5 },
  {
    slug: "tecnici-e-progettazione",
    title: "Tecnici e progettazione",
    order: 6,
  },
  { slug: "manutenzione", title: "Manutenzione", order: 7 },
];

const categoriesBySlug: ReadonlyMap<string, ServiceCategory> = new Map(
  serviceCategories.map((category) => [category.slug, category]),
);

export function listServiceCategories(): readonly ServiceCategory[] {
  return serviceCategories;
}

export function getServiceCategoryBySlug(
  slug: string,
): ServiceCategory | null {
  return categoriesBySlug.get(slug) ?? null;
}
