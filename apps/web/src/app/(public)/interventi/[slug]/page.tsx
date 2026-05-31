import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getSeoInterventionLandingBySlug,
  listSeoInterventionLandings,
} from "../../../../content/seo/intervention-landings";
import { InterventionLandingPage } from "../../../../components/seo/intervention-landing-page";

const defaultOpenGraphImage = "/assets/images/professionisti-hero.webp";

type InterventionSeoPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listSeoInterventionLandings().map((landing) => ({
    slug: landing.slug,
  }));
}

export async function generateMetadata({
  params,
}: InterventionSeoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const landing = getSeoInterventionLandingBySlug(slug);

  if (!landing) {
    return {
      title: "Intervento non trovato",
    };
  }

  const canonicalPath = `/interventi/${landing.slug}`;

  return {
    title: landing.metaTitle,
    description: landing.metaDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: landing.metaTitle,
      description: landing.metaDescription,
      type: "website",
      url: canonicalPath,
      images: [
        {
          url: defaultOpenGraphImage,
          width: 1200,
          height: 630,
          alt: landing.title,
        },
      ],
    },
  };
}

export default async function InterventionSeoPage({
  params,
}: InterventionSeoPageProps) {
  const { slug } = await params;
  const landing = getSeoInterventionLandingBySlug(slug);

  if (!landing) {
    notFound();
  }

  return <InterventionLandingPage landing={landing} />;
}
