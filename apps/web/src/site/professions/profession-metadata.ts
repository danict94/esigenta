import { buildCanonicalPath } from "../seo/engine/canonical";
import type { ProfessionDetailViewModel } from "./resolve-profession-detail";

export type ProfessionSeoMetadata = {
  readonly title: string;
  readonly description: string;
  readonly canonical: string;
};

export function buildProfessionSeoMetadata(
  page: ProfessionDetailViewModel,
): ProfessionSeoMetadata {
  const editorialSeo = page.editorialContent?.seo;
  const categoryName = page.category.name;

  return {
    title:
      editorialSeo?.title ??
      `${categoryName}: ambiti, interventi e preventivi | Esigenta`,
    description:
      editorialSeo?.description ??
      `Scopri gli ambiti e gli interventi associati alla categoria professionale “${categoryName}” e richiedi preventivi per i lavori di casa.`,
    canonical: buildCanonicalPath({
      family: "profession",
      slug: page.category.slug,
    }),
  };
}
