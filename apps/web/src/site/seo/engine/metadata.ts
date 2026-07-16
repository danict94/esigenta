import type { Metadata } from "next";

import { getSeoInterventionLandingBySlug } from "../pages/interventi";
import {
  getCostGuideBySlug,
  getCostGuideCityPageBySlug,
} from "../pages/costi";
import { getSeoGroupLandingBySlug } from "../pages/gruppi";
import { buildCanonicalPath } from "./canonical";

export function buildInterventionMetadata(slug: string): Metadata {
  const landing = getSeoInterventionLandingBySlug(slug);

  if (!landing) {
    return { title: "Intervento non trovato" };
  }

  const canonicalPath = buildCanonicalPath({
    family: "intervention",
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
      siteName: "Esigenta",
      images: [
        {
          // Immagine propria della landing, mai una fissa condivisa tra
          // interventi diversi (stessa regola delle guide costi).
          url: landing.image.src,
          width: 1200,
          height: 630,
          alt: landing.image.alt,
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
      siteName: "Esigenta",
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
      siteName: "Esigenta",
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
      siteName: "Esigenta",
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
    // Fase 5.E — decisione di prodotto: le pagine città leggono la fascia
    // nazionale, non un prezzo locale reale. Restano generate e crawlabili
    // (niente Disallow in robots.ts, così il crawler legge questo tag), ma
    // non spinte in indice finché non avranno dati locali propri.
    robots: { index: false, follow: true },
    openGraph: {
      title: cityPage.metaTitle,
      description: cityPage.metaDescription,
      type: "website",
      url: cityPage.canonicalPath,
      siteName: "Esigenta",
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
