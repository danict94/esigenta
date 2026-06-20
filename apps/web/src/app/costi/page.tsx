import type { Metadata } from "next";

import { buildCostHubMetadata } from "../../site/seo/engine/metadata";
import { buildCostHubCategoryGroups } from "../../site/seo/engine/cost-hub";
import { CostHubPage } from "../../site/seo/templates/cost-hub-template";

export function generateMetadata(): Metadata {
  return buildCostHubMetadata();
}

export default function Page() {
  const categories = buildCostHubCategoryGroups();
  return <CostHubPage categories={categories} />;
}
