import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { impermeabilizzareTettoBase } from "./base";
import { impermeabilizzareTettoFaq } from "./faq";
import { impermeabilizzareTettoLocalOverrides } from "./local-overrides";

export const impermeabilizzareTettoGuide: CostGuide = composeCostGuide({
  base: impermeabilizzareTettoBase,
  faq: impermeabilizzareTettoFaq,
  localOverrides: impermeabilizzareTettoLocalOverrides,
});
