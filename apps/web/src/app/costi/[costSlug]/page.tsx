import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildCostGuideMetadata } from "../../../site/seo/engine/metadata";
import { getCostGuideStaticParams } from "../../../site/seo/engine/static-params";
import { resolveCostGuidePage } from "../../../site/seo/engine/resolve-seo-page";
import { CostGuidePage } from "../../../site/seo/templates/cost-page-template";

type Props = { params: Promise<{ costSlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getCostGuideStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { costSlug } = await params;
  return buildCostGuideMetadata(costSlug);
}

export default async function Page({ params }: Props) {
  const { costSlug } = await params;
  const guide = resolveCostGuidePage(costSlug);

  if (!guide) {
    notFound();
  }

  return <CostGuidePage guide={guide} />;
}
