import type { Metadata } from "next";

import { getSeoInterventionLandingBySlug } from "../pages/interventi";
import {
  getCostGuideBySlug,
  getCostGuideCityPageBySlug,
} from "../pages/costi";
import { getSeoGroupLandingBySlug } from "../pages/gruppi";
import { buildCanonicalPath } from "./canonical";

const ogInterventiImage = "/assets/images/professionisti-hero.webp";

export function buildInterventionMetadata(slug: string): Metadata {
  const landing = getSeoInterventionLandingBySlug(slug);

  if (!landing) {
    return { title: "Intervento non trovato" };
  }

  const canonicalPath = `/interventi/${landing.slug}`;

  return {
    title: landing.metaTitle,
    description: landing.metaDescription,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: landing.metaTitle,
      description: landing.metaDescription,
      type: "website",
      url: canonicalPath,
      images: [
        {
          url: ogInterventiImage,
          width: 1200,
          height: 630,
          alt: landing.title,
        },
      ],
    },
  };
}

export function buildGroupLandingMetadata(slug: string): Metadata {
  const landing = getSeoGroupLandingBySlug(slug);

  if (!landing) {
    return { title: "Servizio non trovato" };
  }

  const canonicalPath = buildCanonicalPath({
    family: "groupHub",
    slug: landing.slug,
  });

  return {
    title: landing.metaTitle,
    description: landing.metaDescription,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: landing.metaTitle,
      description: landing.metaDescription,
      type: "website",
      url: canonicalPath,
    },
  };
}

export function buildCostHubMetadata(): Metadata {
  const title = "Guide ai costi";
  const description =
    "Guide ai costi pubblicate da Esigenta: range di prezzo indicativi, fattori che incidono sul preventivo e domande utili prima di richiedere un intervento.";
  const canonicalPath = "/costi";

  return {
    title,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalPath,
    },
  };
}

export function buildCostGuideMetadata(slug: string): Metadata {
  const guide = getCostGuideBySlug(slug);

  if (!guide) {
    return { title: "Guida costi non trovata" };
  }

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: guide.canonicalPath },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: "website",
      url: guide.canonicalPath,
      images: [
        {
          url: guide.heroImage.src,
          width: 1200,
          height: 630,
          alt: guide.heroImage.alt,
        },
      ],
    },
  };
}

export function buildCostGuideCityMetadata(
  slug: string,
  citySlug: string,
): Metadata {
  const guide = getCostGuideBySlug(slug);
  const cityPage = getCostGuideCityPageBySlug(slug, citySlug);

  if (!guide || !cityPage) {
    return { title: "Guida costi città non trovata" };
  }

  return {
    title: cityPage.metaTitle,
    description: cityPage.metaDescription,
    alternates: { canonical: cityPage.canonicalPath },
    openGraph: {
      title: cityPage.metaTitle,
      description: cityPage.metaDescription,
      type: "website",
      url: cityPage.canonicalPath,
      images: [
        {
          url: guide.heroImage.src,
          width: 1200,
          height: 630,
          alt: guide.heroImage.alt,
        },
      ],
    },
  };
}
