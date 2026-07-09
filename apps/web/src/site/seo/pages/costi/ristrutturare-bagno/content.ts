import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { ristrutturareBagnoBase } from "./base";
import { ristrutturareBagnoFaq } from "./faq";
import { ristrutturareBagnoLocalOverrides } from "./local-overrides";

export const ristrutturareBagnoGuide: CostGuide = composeCostGuide({
  base: ristrutturareBagnoBase,
  faq: ristrutturareBagnoFaq,
  localOverrides: ristrutturareBagnoLocalOverrides,
});
