import { frozenTaxonomySource } from "@esigenta/taxonomy";

import {
  getSeoGroupLandingBySlug,
  type SeoGroupLanding,
} from "../pages/gruppi";
import {
  getSeoInterventionLandingBySlug,
  type SeoInterventionLanding,
} from "../pages/interventi";
import { getCostGuideBySlug, type CostGuide } from "../pages/costi";
import { resolveCostGuideHrefForIntervention } from "./resolve-seo-page";
import { buildCanonicalPath } from "./canonical";

/**
 * Fase 5 — breadcrumb landing intervento → landing gruppo. Link solo se il
 * gruppo dichiarato ha una landing registrata; fail-fast se groupSlug non
 * esiste in taxonomy o se l'intervento non appartiene a quel gruppo (un
 * breadcrumb sbagliato è un errore di contenuto, non un fallback).
 */
export function resolveGroupBreadcrumbForIntervention(
  landing: SeoInterventionLanding,
): { name: string; href: string } | null {
  if (!landing.groupSlug) return null;

  const group = frozenTaxonomySource.projectGroups.find(
    (projectGroup) => projectGroup.slug === landing.groupSlug,
  );

  if (!group) {
    throw new Error(
      `SeoInterventionLanding "${landing.slug}" declares groupSlug ` +
        `"${landing.groupSlug}" which does not exist in the frozen taxonomy`,
    );
  }

  if (
    !group.interventions.some(
      (intervention) => intervention.slug === landing.slug,
    )
  ) {
    throw new Error(
      `SeoInterventionLanding "${landing.slug}" declares groupSlug ` +
        `"${landing.groupSlug}" but is not an intervention of that group`,
    );
  }

  const groupLanding = getSeoGroupLandingBySlug(landing.groupSlug);
  if (!groupLanding) return null;

  return {
    name: groupLanding.title,
    href: buildCanonicalPath({ family: "groupHub", slug: groupLanding.slug }),
  };
}

/**
 * Stesso breadcrumb di gruppo, risolto per una guida costi invece che per una
 * landing intervento. Nessuna relazione nuova da mantenere: riusa
 * interventionSeoSlug (già obbligatorio su CostGuide) per trovare la landing
 * intervento reale, poi la stessa risoluzione fail-fast di sopra. Ritorna
 * null (mai un errore) se quella landing non esiste ancora o non dichiara
 * groupSlug — stesso pattern soft-fail di resolveCostGuideHrefForIntervention.
 */
export function resolveGroupBreadcrumbForCostGuide(
  guide: CostGuide,
): { name: string; href: string } | null {
  const landing = getSeoInterventionLandingBySlug(guide.interventionSeoSlug);
  if (!landing) return null;

  return resolveGroupBreadcrumbForIntervention(landing);
}

export type GroupInterventionItem = {
  slug: string;
  name: string;
  /** Orientamento editoriale da interventionSummaries (obbligatoria per ogni intervento del gruppo). */
  summary: string;
  landingHref: string | null;
  requestHref: string;
  costGuideHref: string | null;
  /** nationalRange della CostGuide reale (market-data), mai una stringa scritta qui. */
  costRange: string | null;
  /**
   * Audit 2026-08: nationalRangeLabel della stessa CostGuide, quando la
   * imposta (es. "Standard, 5–6 mq" per ristrutturare-bagno) — senza questo
   * campo il template ricadeva su una didascalia generica fissa
   * ("Range indicativo"), perdendo il contesto che nationalRange da solo non
   * comunica (a quale scenario/metratura si riferisce il numero). null per
   * le guide che non impostano nationalRangeLabel: comportamento invariato.
   */
  costRangeLabel: string | null;
};

export type GroupLandingPageData = {
  content: SeoGroupLanding;
  interventions: GroupInterventionItem[];
  /**
   * Fase 6 — l'intervento in evidenza NON richiede più una landing SEO reale
   * (solo 5/100 interventi ne hanno una): la descrizione mostrata è sempre
   * `summary`, già obbligatoria per ogni intervento del gruppo. `landingHref`
   * resta null quando non esiste, e il template nasconde il bottone
   * "Approfondisci" di conseguenza — mai un link finto.
   */
  featured: GroupInterventionItem;
  professionalCategories: { slug: string; name: string; href: string }[];
};

/**
 * Server-only (importa @esigenta/taxonomy come related-funnel-work.tsx: mai
 * da Client Component). Ritorna null per slug non registrati (→ notFound),
 * ma fallisce il build per contenuto registrato incoerente: gruppo
 * inesistente in taxonomy, summary mancante/fuori gruppo, o featured fuori
 * dal gruppo. Il featured NON deve avere una landing SEO reale (Fase 6).
 */
export function resolveGroupLandingPage(
  slug: string,
): GroupLandingPageData | null {
  const content = getSeoGroupLandingBySlug(slug);
  if (!content) return null;

  const group = frozenTaxonomySource.projectGroups.find(
    (projectGroup) => projectGroup.slug === content.slug,
  );

  if (!group) {
    throw new Error(
      `SeoGroupLanding "${content.slug}" does not match any ProjectGroup in the frozen taxonomy`,
    );
  }

  const groupInterventionSlugs = new Set(
    group.interventions.map((intervention) => intervention.slug),
  );

  for (const summarySlug of Object.keys(content.interventionSummaries)) {
    if (!groupInterventionSlugs.has(summarySlug)) {
      throw new Error(
        `SeoGroupLanding "${content.slug}" has an interventionSummaries entry ` +
          `for "${summarySlug}" which is not an intervention of that group`,
      );
    }
  }

  // Publication gate: a draft intervention may already have code registered
  // for it (summary, funnel, even a SeoInterventionLanding/CostGuide) while
  // it is being built — none of that becomes a public card until frozen
  // taxonomy says publicationStatus "published". A summary written ahead of
  // time for a still-draft intervention is allowed to exist (checked above),
  // it just never reaches this point.
  const publishedGroupInterventions = group.interventions.filter(
    (intervention) => intervention.publicationStatus === "published",
  );

  const interventions: GroupInterventionItem[] = publishedGroupInterventions.map(
    (intervention) => {
      const summary = content.interventionSummaries[intervention.slug];

      if (!summary) {
        throw new Error(
          `SeoGroupLanding "${content.slug}" is missing an interventionSummaries ` +
            `entry for "${intervention.slug}": every PUBLISHED intervention of ` +
            `the group needs a real orientation summary, never an empty row`,
        );
      }

      const landing = getSeoInterventionLandingBySlug(intervention.slug);
      const costGuideHref = landing
        ? resolveCostGuideHrefForIntervention(landing.costSlug)
        : null;
      const guide =
        landing && costGuideHref && landing.costSlug
          ? getCostGuideBySlug(landing.costSlug)
          : null;

      return {
        slug: intervention.slug,
        name: intervention.name,
        summary,
        landingHref: landing ? `/interventi/${landing.slug}` : null,
        requestHref: `/richiesta/${intervention.slug}`,
        costGuideHref,
        costRange: guide?.nationalRange ?? null,
        costRangeLabel: guide?.nationalRangeLabel ?? null,
      };
    },
  );

  const featured = interventions.find(
    (item) => item.slug === content.featuredInterventionSlug,
  );

  if (!featured) {
    throw new Error(
      `SeoGroupLanding "${content.slug}" declares featuredInterventionSlug ` +
        `"${content.featuredInterventionSlug}" which is not an intervention of that group`,
    );
  }

  const professionalCategories = frozenTaxonomySource.categories
    .filter((category) => category.projectGroups.includes(content.slug))
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      href: `/professionisti/${category.slug}`,
    }));

  return { content, interventions, featured, professionalCategories };
}
