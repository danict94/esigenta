import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCostGuideBySlug,
  getCostGuideCityPageBySlug,
  listCostGuides,
  listIndexableCostGuideCityPages,
} from "../../../../../content/seo/cost-guides";
import { CityCostGuidePage } from "../../../../../components/seo/city-cost-guide-page";

const bathroomOpenGraphImage = "/assets/images/rifacimento-bagno.webp";

type CityCostGuideRouteProps = {
  params: Promise<{
    slug: string;
    citySlug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listCostGuides().flatMap((guide) =>
    listIndexableCostGuideCityPages(guide.slug).map((cityPage) => ({
      slug: guide.slug,
      citySlug: cityPage.citySlug,
    })),
  );
}

export async function generateMetadata({
  params,
}: CityCostGuideRouteProps): Promise<Metadata> {
  const { slug, citySlug } = await params;
  const cityPage = getCostGuideCityPageBySlug(slug, citySlug);

  if (!cityPage) {
    return {
      title: "Guida costi città non trovata",
    };
  }

  return {
    title: cityPage.metaTitle,
    description: cityPage.metaDescription,
    alternates: {
      canonical: cityPage.canonicalPath,
    },
    openGraph: {
      title: cityPage.metaTitle,
      description: cityPage.metaDescription,
      type: "website",
      url: cityPage.canonicalPath,
      images: [
        {
          url: bathroomOpenGraphImage,
          width: 1200,
          height: 630,
          alt: cityPage.title,
        },
      ],
    },
  };
}

export default async function CityCostGuideRoute({
  params,
}: CityCostGuideRouteProps) {
  const { slug, citySlug } = await params;
  const guide = getCostGuideBySlug(slug);
  const cityPage = getCostGuideCityPageBySlug(slug, citySlug);

  if (!guide || !cityPage) {
    notFound();
  }

  return <CityCostGuidePage guide={guide} cityPage={cityPage} />;
}
