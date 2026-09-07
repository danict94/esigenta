import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  listPublicProfessionCategorySlugs,
} from "@esigenta/taxonomy/public-professions";

import { buildProfessionSeoMetadata } from "../../../site/professions/profession-metadata";
import { ProfessionPageTemplate } from "../../../site/professions/profession-page-template";
import { resolveProfessionDetailViewModel } from "../../../site/professions/resolve-profession-detail";

type Props = { params: Promise<{ categorySlug: string }> };

export const dynamicParams = false;

const resolveProfessionPage = cache(resolveProfessionDetailViewModel);

export function generateStaticParams() {
  const slugs = listPublicProfessionCategorySlugs();

  return slugs.map((categorySlug) => ({ categorySlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorySlug } = await params;
  const page = resolveProfessionPage(categorySlug);

  if (!page) {
    return { title: "Professione non trovata" };
  }

  const metadata = buildProfessionSeoMetadata(page);

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: metadata.canonical,
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonical,
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
