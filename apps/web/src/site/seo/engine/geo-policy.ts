import type { CostGuideCityPage } from "../pages/costi/types";

/**
 * Owner reale della policy di indicizzabilità città (prima viveva, di fatto,
 * dentro pages/costi/index.ts). pages/costi/index.ts resta registry e
 * ri-esporta questa funzione, non la definisce.
 */
export function isIndexableCityPage(cityPage: CostGuideCityPage): boolean {
  const hasMinimumLocalContent =
    cityPage.localReading.trim().length > 0 && cityPage.faq.length > 0;

  return (
    cityPage.seoEnabled === true &&
    cityPage.contentStatus === "ready" &&
    cityPage.uniquenessLevel !== "thin" &&
    hasMinimumLocalContent
  );
}
