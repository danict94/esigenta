import type { Metadata } from "next";

import { ServicesHubPage } from "../../site/services/services-hub-page";

export const metadata: Metadata = {
  title: "Servizi",
  description:
    "Tutti i servizi disponibili su Esigenta: ristrutturazioni, impianti, energia e finiture.",
  alternates: { canonical: "/servizi" },
};

export default function Page() {
  return <ServicesHubPage />;
}
