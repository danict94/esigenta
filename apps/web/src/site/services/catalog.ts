import { getSeoInterventionLandingBySlug } from "../seo/pages/interventi";
import type { ServiceCatalogItem } from "./types";

const catalogItems: readonly ServiceCatalogItem[] = [
  {
    slug: "ristrutturare-bagno",
    title: "Ristrutturare bagno",
    status: "SEO_PAGE",
    seoInterventionSlug: "ristrutturare-bagno",
    funnelSlug: "ristrutturare-bagno",
    order: 1,
    homeFeature: {
      description: "Rinnova il bagno con professionisti qualificati.",
      image: "/assets/images/rifacimento-bagno.webp",
      icon: "bath",
      order: 1,
    },
  },
  {
    slug: "rifare-impianto-elettrico",
    title: "Rifare impianto elettrico",
    status: "SEO_PAGE",
    seoInterventionSlug: "rifare-impianto-elettrico",
    funnelSlug: "rifare-impianto-elettrico",
    order: 1,
    homeFeature: {
      description: "Adegua o rinnova l'impianto della tua abitazione.",
      image: "/assets/images/impianto-elettrico.webp",
      icon: "zap",
      order: 2,
    },
  },
  {
    slug: "installare-fotovoltaico",
    title: "Installare fotovoltaico",
    status: "SEO_PAGE",
    seoInterventionSlug: "installare-fotovoltaico",
    funnelSlug: "installare-fotovoltaico",
    order: 1,
    homeFeature: {
      description: "Riduci i consumi con un impianto solare moderno.",
      image: "/assets/images/installazione-fotovoltaico.webp",
      icon: "sun",
      order: 3,
    },
  },
  {
    slug: "rifare-tetto",
    title: "Rifare tetto",
    status: "SEO_PAGE",
    seoInterventionSlug: "rifare-tetto",
    funnelSlug: "rifare-tetto",
    order: 2,
    homeFeature: {
      description: "Ripara o sostituisci la copertura di casa.",
      image: "/assets/images/rifare-tetto.webp",
      icon: "house",
      order: 4,
    },
  },
  {
    slug: "installare-climatizzatore",
    title: "Installare climatizzatore",
    status: "SEO_PAGE",
    seoInterventionSlug: "installare-climatizzatore",
    funnelSlug: "installare-climatizzatore",
    order: 2,
    homeFeature: {
      description: "Trova tecnici per installazione e sostituzione.",
      image: "/assets/images/climatizzazione.webp",
      icon: "fan",
      order: 5,
    },
  },
];

for (const item of catalogItems) {
  if (item.status === "SEO_PAGE") {
    if (!item.seoInterventionSlug) {
      throw new Error(
        `Service catalog item "${item.slug}" has status SEO_PAGE but no seoInterventionSlug`,
      );
    }

    const landing = getSeoInterventionLandingBySlug(item.seoInterventionSlug);

    if (!landing) {
      throw new Error(
        `Service catalog item "${item.slug}" points to seoInterventionSlug ` +
          `"${item.seoInterventionSlug}" which does not exist in the SEO interventi registry`,
      );
    }

    if (item.funnelSlug !== landing.funnelSlug) {
      throw new Error(
        `Service catalog item "${item.slug}" declares funnelSlug "${item.funnelSlug}" ` +
          `but the SEO landing "${item.seoInterventionSlug}" declares funnelSlug "${landing.funnelSlug}"`,
      );
    }
  }

  if (
    item.homeFeature &&
    item.status !== "SEO_PAGE" &&
    item.status !== "FUNNEL_ONLY"
  ) {
    throw new Error(
      `Service catalog item "${item.slug}" has homeFeature but status "${item.status}" ` +
        `is not publicly linkable — a PLANNED/HIDDEN item must never be featured in home`,
    );
  }
}

const catalogBySlug: ReadonlyMap<string, ServiceCatalogItem> = new Map(
  catalogItems.map((item) => [item.slug, item]),
);

export function listServiceCatalogItems(): readonly ServiceCatalogItem[] {
  return catalogItems;
}

export function getServiceCatalogItemBySlug(
  slug: string,
): ServiceCatalogItem | null {
  return catalogBySlug.get(slug) ?? null;
}

/** SEO_PAGE e FUNNEL_ONLY hanno una destinazione reale; PLANNED e HIDDEN non vanno mai linkate pubblicamente. */
export function isPubliclyLinkable(item: ServiceCatalogItem): boolean {
  return item.status === "SEO_PAGE" || item.status === "FUNNEL_ONLY";
}

export function listPubliclyLinkableServiceCatalogItems(): readonly ServiceCatalogItem[] {
  return catalogItems.filter(isPubliclyLinkable);
}

/** Destinazione reale di una voce pubblicamente linkabile, null per PLANNED/HIDDEN o dati incompleti. */
export function getServiceCatalogItemHref(
  item: ServiceCatalogItem,
): string | null {
  if (item.status === "SEO_PAGE" && item.seoInterventionSlug) {
    return `/interventi/${item.seoInterventionSlug}`;
  }

  if (item.status === "FUNNEL_ONLY" && item.funnelSlug) {
    return item.taskSlug
      ? `/richiesta/${item.funnelSlug}?task=${item.taskSlug}`
      : `/richiesta/${item.funnelSlug}`;
  }

  return null;
}

/**
 * Voci in evidenza per la home: solo item con homeFeature e status pubblicamente
 * linkabile (garanzia già applicata a module-load time dal blocco di validazione
 * sopra), ordinate per homeFeature.order.
 */
export function listFeaturedServiceCatalogItems(): readonly ServiceCatalogItem[] {
  return catalogItems
    .filter((item) => item.homeFeature !== undefined && isPubliclyLinkable(item))
    .slice()
    .sort((a, b) => (a.homeFeature?.order ?? 0) - (b.homeFeature?.order ?? 0));
}
