import {
  getServiceCatalogItemHref,
  listFeaturedServiceCatalogItems,
} from "../services";

export type HomeSystem = {
  slug: string;
  title: string;
  image: string;
  href: string;
};

// The five featured services, reused as the "systems" the house is
// decomposed into across the hero scatter and the module stack below it.
export function getHomeSystems(): HomeSystem[] {
  return listFeaturedServiceCatalogItems()
    .map((item) => {
      const href = getServiceCatalogItemHref(item);

      if (!href || !item.homeFeature) {
        return null;
      }

      return { slug: item.slug, title: item.title, image: item.homeFeature.image, href };
    })
    .filter((item): item is HomeSystem => item !== null);
}
