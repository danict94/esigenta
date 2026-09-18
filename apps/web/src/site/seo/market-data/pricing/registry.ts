import type { BasePriceRange } from "../shared/types";
import { validatePriceRowIntegrity } from "../shared/validation";
import { ristrutturareBagnoPricing } from "./guides/ristrutturare-bagno";
import { rifareTettoPricing } from "./guides/rifare-tetto";
import { rifareFacciataPricing } from "./guides/rifare-facciata";
import { rifareImpiantoElettricoPricing } from "./guides/rifare-impianto-elettrico";
import { impermeabilizzareTettoPricing } from "./guides/impermeabilizzare-tetto";
import { impermeabilizzareTerrazzoPricing } from "./guides/impermeabilizzare-terrazzo";
import { rifarePavimentiPricing } from "./guides/rifare-pavimenti";

export const basePriceRangesByFamily: Record<string, BasePriceRange> = {
  "costGuide:ristrutturare-bagno": ristrutturareBagnoPricing,
  "costGuide:rifare-tetto": rifareTettoPricing,
  "costGuide:impermeabilizzare-tetto": impermeabilizzareTettoPricing,
  "costGuide:impermeabilizzare-terrazzo": impermeabilizzareTerrazzoPricing,
  "costGuide:rifare-impianto-elettrico": rifareImpiantoElettricoPricing,
  "costGuide:rifare-facciata": rifareFacciataPricing,
  "costGuide:rifare-pavimenti": rifarePavimentiPricing,
};

validatePriceRowIntegrity(basePriceRangesByFamily);
