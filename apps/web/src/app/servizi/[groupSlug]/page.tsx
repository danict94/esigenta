import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildGroupLandingMetadata } from "../../../site/seo/engine/metadata";
import { getGroupLandingStaticParams } from "../../../site/seo/engine/static-params";
import { resolveGroupLandingPage } from "../../../site/seo/engine/resolve-group-page";
import { GroupLandingPage } from "../../../site/seo/templates/group-page-template";

type Props = { params: Promise<{ groupSlug: string }> };

// Solo i gruppi registrati in site/seo/pages/gruppi esistono come pagine:
// nessuna generazione libera di gruppi non abilitati.
export const dynamicParams = false;

export function generateStaticParams() {
  return getGroupLandingStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { groupSlug } = await params;
  return buildGroupLandingMetadata(groupSlug);
}

export default async function Page({ params }: Props) {
  const { groupSlug } = await params;
  const data = resolveGroupLandingPage(groupSlug);

  if (!data) {
    notFound();
  }

  return <GroupLandingPage data={data} />;
}
