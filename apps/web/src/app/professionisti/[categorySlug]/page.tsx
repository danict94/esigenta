import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProfessionPage, listProfessionPageCategorySlugs } from "@esigenta/taxonomy";

import { buildCanonicalPath } from "../../../site/seo/engine/canonical";
import { ProfessionPageTemplate } from "../../../site/professions/profession-page-template";

type Props = { params: Promise<{ categorySlug: string }> };

export async function generateStaticParams() {
  const slugs = await listProfessionPageCategorySlugs();

  return slugs.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const page = await getProfessionPage(categorySlug);

  if (!page) {
    return { title: "Professione non trovata" };
  }

  return {
    title: page.category.name,
    description:
      page.category.description ??
      `Trova richieste e interventi per ${page.category.name.toLowerCase()}.`,
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
