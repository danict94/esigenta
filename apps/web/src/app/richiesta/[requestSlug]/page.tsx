import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { resolveInterventionForFunnel } from "@esigenta/taxonomy";
import { createRuntimeFunnel } from "@esigenta/funnel/server";

import { RequestFlowPage } from "../../../richiesta/flow/request-flow-page";

import type { JsonRuntimeFunnelPayload } from "../../../richiesta/flow/runtime-payload";

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

  // `intervention` is already resolved above, so this reuses it instead of
  // resolving the same slug a second time (createRuntimeFunnel accepts
  // either a slug or an already-resolved record — see
  // packages/funnel/src/orchestration/create-runtime-funnel.ts).
  const runtimeFunnel = await createRuntimeFunnel({ intervention });

  if (!runtimeFunnel) {
    // Cannot happen: `intervention` above is a non-null record, and that
    // branch of createRuntimeFunnel never re-queries or can fail to
    // resolve. A null here would mean an actual bug in the orchestration
    // layer, not a missing intervention — surface it as a real error
    // instead of masking it behind notFound().
    throw new Error(
      `createRuntimeFunnel returned no payload for already-resolved intervention "${intervention.slug}"`,
    );
  }

  const initialRuntime: JsonRuntimeFunnelPayload = {
    ...runtimeFunnel,
    requestDraft: {
      ...runtimeFunnel.requestDraft,
      createdAt: runtimeFunnel.requestDraft.createdAt.toISOString(),
    },
  };

  return (
    <RequestFlowPage
      interventionSlug={requestSlug}
      initialRuntime={initialRuntime}
    />
  );
}
