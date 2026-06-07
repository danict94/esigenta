import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getCostGuideBySlug,
  listCostGuides,
} from "../../../../content/seo/cost-guides";
import { CostGuidePage } from "../../../../components/seo/cost-guide-page";

const bathroomOpenGraphImage = "/assets/images/rifacimento-bagno.webp";

type CostGuideRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return listCostGuides().map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: CostGuideRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getCostGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Guida costi non trovata",
    };
  }

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: {
      canonical: guide.canonicalPath,
    },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      type: "website",
      url: guide.canonicalPath,
      images: [
        {
          url: bathroomOpenGraphImage,
          width: 1200,
          height: 630,
          alt: guide.title,
        },
      ],
    },
  };
}

export default async function CostGuideRoute({ params }: CostGuideRouteProps) {
  const { slug } = await params;
  const guide = getCostGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return <CostGuidePage guide={guide} />;
}
