import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildInterventionMetadata } from "../../../site/seo/engine/metadata";
import { getInterventionStaticParams } from "../../../site/seo/engine/static-params";
import { resolveInterventionPage } from "../../../site/seo/engine/resolve-seo-page";
import { InterventionLandingPage } from "../../../site/seo/templates/intervention-page-template";

type Props = { params: Promise<{ interventoSlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getInterventionStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { interventoSlug } = await params;
  return buildInterventionMetadata(interventoSlug);
}

export default async function Page({ params }: Props) {
  const { interventoSlug } = await params;
  const landing = resolveInterventionPage(interventoSlug);

  if (!landing) {
    notFound();
  }

  return <InterventionLandingPage landing={landing} />;
}
