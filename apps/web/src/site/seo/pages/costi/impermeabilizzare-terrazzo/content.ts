import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { impermeabilizzareTerrazzoBase } from "./base";
import { impermeabilizzareTerrazzoFaq } from "./faq";
import { impermeabilizzareTerrazzoLocalOverrides } from "./local-overrides";

export const impermeabilizzareTerrazzoGuide: CostGuide = composeCostGuide({
  base: impermeabilizzareTerrazzoBase,
  faq: impermeabilizzareTerrazzoFaq,
  localOverrides: impermeabilizzareTerrazzoLocalOverrides,
});
