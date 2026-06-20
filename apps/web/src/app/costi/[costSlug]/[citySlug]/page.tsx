import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildCostGuideCityMetadata } from "../../../../site/seo/engine/metadata";
import { getCostGuideCityStaticParams } from "../../../../site/seo/engine/static-params";
import {
  resolveCostGuidePage,
  resolveCostGuideCityPage,
} from "../../../../site/seo/engine/resolve-seo-page";
import { CityCostGuidePage } from "../../../../site/seo/templates/cost-city-page-template";

type Props = { params: Promise<{ costSlug: string; citySlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCostGuideCityStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { costSlug, citySlug } = await params;
  return buildCostGuideCityMetadata(costSlug, citySlug);
}

export default async function Page({ params }: Props) {
  const { costSlug, citySlug } = await params;
  const guide = resolveCostGuidePage(costSlug);
  const cityPage = resolveCostGuideCityPage(costSlug, citySlug);

  if (!guide || !cityPage) {
    notFound();
  }

  return <CityCostGuidePage guide={guide} cityPage={cityPage} />;
}
