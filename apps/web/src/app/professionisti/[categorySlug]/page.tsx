import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  listPublicProfessionCategorySlugs,
} from "@esigenta/taxonomy/public-professions";

import { buildCanonicalPath } from "../../../site/seo/engine/canonical";
import { ProfessionPageTemplate } from "../../../site/professions/profession-page-template";
import {
  resolveProfessionDetailViewModel,
  type ProfessionDetailViewModel,
} from "../../../site/professions/resolve-profession-detail";

type Props = { params: Promise<{ categorySlug: string }> };

export const dynamicParams = false;

const resolveProfessionPage = cache(resolveProfessionDetailViewModel);

export function generateStaticParams() {
  const slugs = listPublicProfessionCategorySlugs();

  return slugs.map((categorySlug) => ({ categorySlug }));
}

/**
 * Frase naturale, mai un dump della lista interventi (causa dello snippet
 * concatenato "01Disostruire scarichi ; 02..."): prime interventions reali
 * della categoria, nell'ordine in cui compaiono in pagina.
 */
function buildProfessionMetaDescription(page: ProfessionDetailViewModel): string {
  const interventionNames = Array.from(
    new Set(
      page.groups.flatMap((group) =>
        group.interventions.map((intervention) => intervention.name),
      ),
    ),
  ).slice(0, 3);

  if (interventionNames.length === 0) {
    return `Trova richieste e interventi per ${page.category.name.toLowerCase()}.`;
  }

  const lowerFirst = (value: string) => value.charAt(0).toLowerCase() + value.slice(1);
  const items = interventionNames.map(lowerFirst);
  const list =
    items.length === 1
      ? items[0]
      : `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;

  return `${page.category.name}: interventi come ${list}. Descrivi il lavoro e richiedi preventivi da professionisti verificati nella tua zona.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const page = resolveProfessionPage(categorySlug);

  if (!page) {
    return { title: "Professione non trovata" };
  }

  return {
    title: page.category.name,
    // Sempre il generatore conciso: category.description è l'introduzione
    // editoriale visibile in pagina, non va riusata integralmente qui
    // (og/twitter ereditano description quando non dichiarati a parte).
    description: buildProfessionMetaDescription(page),
    alternates: {
      canonical: buildCanonicalPath({ family: "profession", slug: categorySlug }),
    },
  };
}

export default async function Page({ params }: Props) {
  const { categorySlug } = await params;
  const page = resolveProfessionPage(categorySlug);

  if (!page) {
    notFound();
  }

  return <ProfessionPageTemplate page={page} />;
}
