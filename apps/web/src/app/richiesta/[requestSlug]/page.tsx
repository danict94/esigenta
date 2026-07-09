import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resolveInterventionForFunnel } from "@esigenta/taxonomy";

import { RequestFlowPage } from "../../../richiesta/flow/request-flow-page";

// Il funnel è solo conversione: mai in indice, mai canonical/OG, mai in
// sitemap. Il meta noindex è l'unico meccanismo di esclusione: la route
// resta volutamente crawlabile (nessun Disallow in robots.ts), altrimenti
// i crawler non potrebbero leggerlo.
export const metadata: Metadata = {
  title: "Richiesta preventivi",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ requestSlug: string }>;
  searchParams: Promise<{ q?: string }>;
};

export default async function Page({ params, searchParams }: Props) {
  const { requestSlug } = await params;
  const { q } = await searchParams;

  const intervention = await resolveInterventionForFunnel(requestSlug);

  if (!intervention) {
    notFound();
  }

  return <RequestFlowPage interventionSlug={requestSlug} query={q} />;
}
