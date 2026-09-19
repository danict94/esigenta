import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { ristrutturareCucinaBase } from "./base";
import { ristrutturareCucinaFaq } from "./faq";

export const ristrutturareCucinaGuide: CostGuide = composeCostGuide({
  base: ristrutturareCucinaBase,
  faq: ristrutturareCucinaFaq,
  localOverrides: [],
});
