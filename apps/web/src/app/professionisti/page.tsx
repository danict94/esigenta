import type { Metadata } from "next";

import { listPublicProfessionHubItems } from "@esigenta/taxonomy/public-professions";

import { ProfessionsHubPage } from "../../site/professions/professions-hub-page";

export const metadata: Metadata = {
  title: "Professionisti per lavori di casa | Esigenta",
  description:
    "Trova professionisti per i lavori di casa ed esplora le categorie professionali disponibili su Esigenta.",
  alternates: { canonical: "/professionisti" },
};

export default function Page() {
  const professions = listPublicProfessionHubItems();

  return <ProfessionsHubPage professions={professions} />;
}
