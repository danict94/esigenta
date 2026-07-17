import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

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

  // ?q= è un residuo di link vecchi (home-hero.tsx non lo genera più): va
  // eliminato lato server, prima che qualunque codice client (incluso un
  // eventuale Analytics futuro sul funnel) possa vedere l'URL con il testo
  // libero. Nessun tentativo di recuperarlo: per i rarissimi link legacy si
  // accetta di scartarlo piuttosto che rischiare di inviarlo ad Analytics.
  if (q) {
    redirect(`/richiesta/${encodeURIComponent(requestSlug)}`);
  }

  const intervention = await resolveInterventionForFunnel(requestSlug);

  if (!intervention) {
    notFound();
  }

  return <RequestFlowPage interventionSlug={requestSlug} />;
}
