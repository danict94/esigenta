import { composeCostGuide } from "../../../engine/compose-cost-guide";
import type { CostGuide } from "../types";
import { rifarePavimentiBase } from "./base";
import { rifarePavimentiFaq } from "./faq";
import { rifarePavimentiLocalOverrides } from "./local-overrides";

export const rifarePavimentiGuide: CostGuide = composeCostGuide({
  base: rifarePavimentiBase,
  faq: rifarePavimentiFaq,
  localOverrides: rifarePavimentiLocalOverrides,
});
