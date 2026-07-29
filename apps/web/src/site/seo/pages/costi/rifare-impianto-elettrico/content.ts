import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { rifareImpiantoElettricoBase } from "./base";
import { rifareImpiantoElettricoFaq } from "./faq";
import { rifareImpiantoElettricoLocalOverrides } from "./local-overrides";

export const rifareImpiantoElettricoGuide: CostGuide = composeCostGuide({
  base: rifareImpiantoElettricoBase,
  faq: rifareImpiantoElettricoFaq,
  localOverrides: rifareImpiantoElettricoLocalOverrides,
});
