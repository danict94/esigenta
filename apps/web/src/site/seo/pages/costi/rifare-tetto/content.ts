import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { rifareTettoBase } from "./base";
import { rifareTettoFaq } from "./faq";
import { rifareTettoLocalOverrides } from "./local-overrides";

export const rifareTettoGuide: CostGuide = composeCostGuide({
  base: rifareTettoBase,
  faq: rifareTettoFaq,
  localOverrides: rifareTettoLocalOverrides,
});
