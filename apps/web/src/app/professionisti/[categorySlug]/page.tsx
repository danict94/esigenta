import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getProfessionPage,
  listProfessionPageCategorySlugs,
  type ProfessionPage,
} from "@esigenta/taxonomy";

import { buildCanonicalPath } from "../../../site/seo/engine/canonical";
import { ProfessionPageTemplate } from "../../../site/professions/profession-page-template";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateStaticParams() {
  const slugs = await listProfessionPageCategorySlugs();

  return slugs.map((categorySlug) => ({ categorySlug }));
}

/**
 * Frase naturale, mai un dump della lista interventi (causa dello snippet
 * concatenato "01Disostruire scarichi ; 02..."): prime interventions reali
 * della categoria, nell'ordine in cui compaiono in pagina.
 */
function buildProfessionMetaDescription(page: ProfessionPage): string {
  const interventionNames = Array.from(
    new Set(
      page.projectGroups.flatMap((group) =>
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
  const page = await getProfessionPage(categorySlug);

  if (!page) {
    return { title: "Professione non trovata" };
  }

  return {
    title: page.category.name,
    description: page.category.description ?? buildProfessionMetaDescription(page),
    alternates: {
      canonical: buildCanonicalPath({ family: "profession", slug: categorySlug }),
    },
  };
}

export default async function Page({ params }: Props) {
  const { categorySlug } = await params;
  const page = await getProfessionPage(categorySlug);

  if (!page) {
    notFound();
  }

  return <ProfessionPageTemplate page={page} />;
}
