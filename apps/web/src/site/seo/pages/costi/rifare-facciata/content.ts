import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { rifareFacciataBase } from "./base";
import { rifareFacciataFaq } from "./faq";
import { rifareFacciataLocalOverrides } from "./local-overrides";

export const rifareFacciataGuide: CostGuide = composeCostGuide({
  base: rifareFacciataBase,
  faq: rifareFacciataFaq,
  localOverrides: rifareFacciataLocalOverrides,
});
